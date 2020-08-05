import json
from datetime import datetime, timezone

import django_rq
from django.conf import settings
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _
from rasterio.transform import Affine
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.mixins import ProjectRelatedModelListMixin
from projects.models import Project, File
from projects.permissions import (HasAccessToRelatedProjectPermission,
                                  HasUserAPIKey)
from projects.views import RelatedProjectAPIView

from .models import (Annotation, Estimator, ImageTile, PredictionJob,
                     TrainingJob)
from .permissions import HasAccessToRelatedEstimatorPermission
from .serializers import (AnnotationSerializer, EstimatorSerializer,
                          ImageTileSerializer, PredictionJobSerializer,
                          TrainingJobSerializer)
from storage.client import Client
from tasks import states
from tasks.serializers import TaskSerializer
from tasks.models import Task
from credits.models import LogEntry as CreditsLogEntry
from terra.utils import slack_notify


class EstimatorViewSet(ProjectRelatedModelListMixin, viewsets.ModelViewSet):
    queryset = Estimator.objects.all().order_by('-created_at')
    serializer_class = EstimatorSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)
    lookup_field = 'uuid'


class ImageTileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImageTile.objects.all().order_by('index')
    serializer_class = ImageTileSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)

    def get_queryset(self):
        queryset = self.queryset
        files = [
            f for f in self.request.query_params.get('files', '').split(',')
            if f
        ]
        queryset = queryset.filter(file__name__in=files)
        return queryset


class AnnotationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)

    def create(self, request):
        instance = self.get_object_from_request(request)
        if instance:
            serializer = self.get_serializer(instance, data=request.data)
        else:
            serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if instance:
            detail = _("Annotations updated")
        else:
            detail = _("Annotations created")

        return Response({"detail": detail}, status=status.HTTP_200_OK)

    def get_object_from_request(self, request):
        estimator_uuid = request.data['estimator']
        image_tile_id = request.data['image_tile']
        return self.queryset.filter(estimator__uuid=estimator_uuid,
                                    image_tile=image_tile_id).first()

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        estimator = params.get('estimator', '')
        if estimator:
            queryset = queryset.filter(estimator__uuid=estimator)

        tiles = [id for id in params.get('image_tile', '').split(',') if id]
        if tiles:
            queryset = queryset.filter(image_tile__in=tiles)

        return queryset


# FIXME project permission missing!
class SegmentsPerLabelView(APIView):
    def get(self, request, uuid):
        annotations = Annotation.objects.filter(estimator__uuid=uuid)

        segments_per_label = {}
        for annot in annotations:
            for segment in annot.segments:
                if segment['label'] not in segments_per_label:
                    segments_per_label[segment['label']] = 0
                segments_per_label[segment['label']] += 1

        return Response({'detail': segments_per_label},
                        status=status.HTTP_200_OK)


class AnnotationUpload(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def post(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        project = Project.objects.filter(uuid=request.data['project'])
        if not project:
            return Response({'project': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        client = Client(project.first())

        files = list(client.list_files(request.data['related_file']))
        if not files:
            return Response({'related_file': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        vector_files = list(client.list_files(request.data['vector_file']))
        if not vector_files:
            return Response({'vector_file': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        annotations = Annotation.import_from_vector_file(
            project.first(),
            vector_files[0],
            files[0],
            estimator=estimator,
            label=request.data['label'],
        )

        return Response({'detail': {
            'annotation_created': len(annotations)
        }},
                        status=status.HTTP_200_OK)


class StartTrainingJobView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def post(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)
        job = Task.objects.filter(Q(state='STARTED') | Q(state='PENDING'),
                                  kwargs__estimator=str(
                                      estimator.uuid),
                                  name=Estimator.TRAINING_JOB_TASK).first()
        if not job:
            # Estimate task duration and cost
            training_duration = estimator.estimated_training_duration
            task_cost = CreditsLogEntry.calculate_task_cost(
                duration=training_duration)

            # If user has not enough credits for task, fail!
            if CreditsLogEntry.available_credits(
                    estimator.project.owner) < task_cost:
                return Response(
                    {'estimator': _('Not enough credits for training')},
                    status=status.HTTP_400_BAD_REQUEST)

            # Otherwise, create and start task
            job = Task.objects.create(
                name=Estimator.TRAINING_JOB_TASK,
                project=estimator.project,
                estimated_duration=training_duration,
                kwargs=dict(
                    estimator=str(estimator.uuid)),
                internal_metadata=dict(uses_cloudml=True))
            job.start()

            try:
                slack_notify(
                    f'User {request.user.username} started a training task {job.id} for estimator {estimator.id}'
                )
            except:
                pass

        serializer = TaskSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)


class StartPredictionJobView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def post(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        last_training_job = Task.objects.filter(
            kwargs__estimator=str(estimator.uuid),
            state=states.FINISHED,
            name=Estimator.TRAINING_JOB_TASK).last()
        if not last_training_job:
            return Response({'training_job': _('Not found')},
                            status=status.HTTP_400_BAD_REQUEST)

        job = Task.objects.filter(Q(state='STARTED') | Q(state='PENDING'),
                                  kwargs__estimator=str(
                                      estimator.uuid),
                                  name=Estimator.PREDICTION_JOB_TASK).first()

        if not job:
            # If user has no credits, fail!
            # Contrary to training, we still don't have a reliable way to
            # estimate prediction task duration, so we only check if it has any
            # credits at all, and allow negative credit balance in the worst
            # case scenario.
            if CreditsLogEntry.available_credits(estimator.project.owner) <= 0:
                return Response(
                    {'estimator': _('Not enough credits for prediction')},
                    status=status.HTTP_400_BAD_REQUEST)

            files = File.objects.filter(name__in=request.data.get('files'),
                                        project=estimator.project,
                                        owner=request.user)
            job = Task.objects.create(
                name=Estimator.PREDICTION_JOB_TASK,
                project=estimator.project,
                kwargs=dict(
                    estimator=str(estimator.uuid),
                    training_job=last_training_job.pk,
                    tiles_folders=request.data.get('files'),
                    confidence=request.data.get(
                        'confidence',
                        settings.CLOUDML_DEFAULT_PREDICTION_CONFIDENCE)
                ),
                internal_metadata=dict(uses_cloudml=True))
            job.start()

            try:
                slack_notify(
                    f'User {request.user.username} started a prediction task {job.id} for estimator {estimator.id}'
                )
            except:
                pass

        serializer = TaskSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)


class StartImageTilingJobView(RelatedProjectAPIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )

    def post(self, request):
        path = request.data.get('path', None)
        if not path:
            return Response({'path': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)
        output_path = request.data.get('output_path', None)
        if not output_path:
            return Response({'output_path': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)
        project = self.get_project()
        job = Task.objects.filter(Q(state='STARTED') | Q(state='PENDING'),
                                  kwargs__path=path,
                                  project=project,
                                  name=Estimator.IMAGE_TILING_TASK).first()
        if not job:
            job = Task.objects.create(
                name=Estimator.IMAGE_TILING_TASK,
                project=project,
                kwargs=dict(
                    path=path,
                    output_path=output_path,
                    tile_size=request.data.get('tile_size', None)))
            job.start()

            try:
                slack_notify(
                    f'User {request.user.username} started an image tiling task {job.id}'
                )
            except:
                pass

        serializer = TaskSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)
