from datetime import datetime, timezone
from django.conf import settings
from django.db.models import Q
from django.shortcuts import render
from estimators.models import Estimator
from estimators.permissions import HasAccessToRelatedEstimatorPermission
from projects.permissions import HasAccessToRelatedProjectPermission, HasUserAPIKey
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from tasks.models import Task
from tasks.serializers import TaskSerializer
from terra.emails import TrainingStartedEmail, PredictionStartedEmail


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
                                      estimator.uuid)).first()
        if not job:
            job = Task.objects.create(
                name="estimators.tasks.start_training_job",
                project=estimator.project,
                internal_metadata={'estimator': str(estimator.uuid)})
            job.start()
            # Send email
            """
            user = request.user
            email = TrainingStartedEmail(estimator=estimator,
                                         recipients=[user.email],
                                         language_code='es')
            email.send_mail()
            """
        serializer = TaskSerializer(job)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)


class FinishedTraininJobView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedEstimatorPermission)

    def get(self, request, uuid):
        estimator = Estimator.objects.get(uuid=uuid)
        if not estimator:
            return Response({'estimator': _('Not found')},
                            status=status.HTTP_404_NOT_FOUND)

        pending_task = Task.objects.filter(
            Q(state='STARTED') | Q(state='PENDING'),
            internal_metadata__estimator=str(estimator.uuid)).first()
        if pending_task is None:
            #TODO Como chequear el estado de una tarea terminada, tal vez sea mejor con el id de tarea y no con el uuid de estimador
            last_finished_job = Task.objects.filter(
                internal_metadata__estimator=str(estimator.uuid)).last()
            data = {'detail': last_finished_job.state}
        else:
            #A pending job exists
            data = {'detail': pending_task.state}
            now = datetime.now(timezone.utc)
            dif_minutes = (now - pending_task.created_at).total_seconds() / 60
            data['percentage'] = round(dif_minutes * 100 /
                                       settings.APROX_JOBS_TIME)

        return Response(data, status=status.HTTP_200_OK)
