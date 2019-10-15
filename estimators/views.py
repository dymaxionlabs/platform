import django_rq
from datetime import datetime, timezone
from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.mixins import ProjectRelatedModelListMixin
from projects.models import File
from projects.permissions import HasAccessToRelatedProjectPermission, HasUserAPIKey
from terra.emails import TrainingStartedEmail, PredictionStartedEmail

from .models import (Annotation, Estimator, ImageTile, TrainingJob,
                     PredictionJob)
from .permissions import HasAccessToRelatedEstimatorPermission
from .serializers import (AnnotationSerializer, EstimatorSerializer,
                          ImageTileSerializer, TrainingJobSerializer,
                          PredictionJobSerializer)


class EstimatorViewSet(ProjectRelatedModelListMixin, viewsets.ModelViewSet):
    queryset = Estimator.objects.all().order_by('-created_at')
    serializer_class = EstimatorSerializer
    permission_classes = (permissions.IsAuthenticated,
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


class StartTrainingJobView(APIView):
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def post(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        job = TrainingJob.objects.filter(estimator=estimator,
                                         finished=False).first()
        if not job:
            job = TrainingJob.objects.create(estimator=estimator)

            # Send email
            user = request.user
            email = TrainingStartedEmail(estimator=estimator,
                                         recipients=[user.email],
                                         language_code='es')
            email.send_mail()

        serializer = TrainingJobSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)


class FinishedTraininJobView(APIView):
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def get(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        pending_job = TrainingJob.objects.filter(estimator=estimator,
                                                 finished=False).first()
        data = {'detail': pending_job is None}
        if pending_job is not None:
            now = datetime.now(timezone.utc)
            dif_minutes = (now - pending_job.created_at).total_seconds() / 60
            data['percentage'] = round(dif_minutes * 100 /
                                       settings.APROX_JOBS_TIME)

        return Response(data, status=status.HTTP_200_OK)


class StartPredictionJobView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def post(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        last_training_job = TrainingJob.objects.filter(estimator=estimator,
                                                       finished=True).last()
        if not last_training_job:
            return Response({'training_job': _('Not found')},
                            status=status.HTTP_400_BAD_REQUEST)

        job = PredictionJob.objects.filter(estimator=estimator,
                                           finished=False).first()

        if not job:
            files = File.objects.filter(name__in=request.data.get('files'),
                                        project=estimator.project,
                                        owner=request.user)
            job = PredictionJob.objects.create(
                estimator=estimator,
                metadata={'training_job': last_training_job.pk})
            job.image_files.set(files)
            job.save()
            django_rq.enqueue('estimators.tasks.start_prediction_job', job.pk)

            # Send email
            user = request.user
            email = PredictionStartedEmail(estimator=estimator,
                                           recipients=[user.email],
                                           language_code='es')
            email.send_mail()

        serializer = PredictionJobSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)


class FinishedPredictionJobView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def get(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        pending_job = PredictionJob.objects.filter(estimator=estimator,
                                                   finished=False).first()
        data = {'detail': pending_job is None}
        if pending_job is not None:
            now = datetime.now(timezone.utc)
            dif_minutes = (now - pending_job.created_at).total_seconds() / 60
            data['percentage'] = round(dif_minutes * 100 /
                                       settings.APROX_JOBS_TIME)

        return Response(data, status=status.HTTP_200_OK)


class PredictionJobView(generics.RetrieveAPIView):
    model = PredictionJob
    serializer_class = PredictionJobSerializer
    queryset = PredictionJob.objects.all()
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )
