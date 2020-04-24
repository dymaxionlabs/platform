from datetime import datetime, timezone
from django.conf import settings
from django.db.models import Q
from django.shortcuts import render
from estimators.models import Estimator
from estimators.permissions import HasAccessToRelatedEstimatorPermission
from projects.mixins import ProjectRelatedModelListMixin
from projects.permissions import HasAccessToRelatedProjectPermission, HasUserAPIKey
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from tasks.models import Task
from tasks.serializers import TaskSerializer
from terra.emails import TrainingStartedEmail, PredictionStartedEmail


class TaskViewSet(ProjectRelatedModelListMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)


class StartTrainingJobView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def post(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)
        job = Task.objects.filter(Q(state='STARTED') | Q(state='PENDING'),
                                  internal_metadata__estimator=str(
                                      estimator.uuid),
                                  name=Estimator.TRAINING_JOB_TASK).first()
        if not job:
            job = Task.objects.create(
                name=Estimator.TRAINING_JOB_TASK,
                project=estimator.project,
                external=True,
                internal_metadata={'estimator': str(estimator.uuid)})
            job.start()
            # Send email
            #TODO: Delete this comments before merge
            """
            user = request.user
            email = TrainingStartedEmail(estimator=estimator,
                                         recipients=[user.email],
                                         language_code='es')
            email.send_mail()
            """
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
            internal_metadata__estimator=str(estimator.uuid),
            state='FINISHED',
            name=Estimator.TRAINING_JOB_TASK).last()
        if not last_training_job:
            return Response({'training_job': _('Not found')},
                            status=status.HTTP_400_BAD_REQUEST)

        job = Task.objects.filter(internal_metadata__estimator=str(
            estimator.uuid),
                                  state='FINISHED',
                                  name=Estimator.PREDICTION_JOB_TASK).first()

        if not job:
            files = File.objects.filter(name__in=request.data.get('files'),
                                        project=estimator.project,
                                        owner=request.user)
            job = Task.objects.create(name=Estimator.PREDICTION_JOB_TASK,
                                      project=estimator.project,
                                      external=True,
                                      internal_metadata={
                                          'estimator': str(estimator.uuid),
                                          'training_job': last_training_job.pk,
                                          'image_files':
                                          request.data.get('files')
                                      })

            # Send email
            #TODO: Delete this comments before merge
            """
            user = request.user
            email = PredictionStartedEmail(estimator=estimator,
                                           recipients=[user.email],
                                           language_code='es')
            email.send_mail()
            """
        serializer = TaskSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)
