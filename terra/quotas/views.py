from django.shortcuts import render
from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from projects.permissions import HasUserAPIKey
from .models import UserQuota
from .serializers import UserQuotaSerializer
from django.conf import settings
from estimators.models import Estimator
from projects.models import Project
from storage.models import File
from tasks.models import Task


class UserQuotaView(generics.RetrieveAPIView):
    queryset = UserQuota.objects.all()
    serializer_class = UserQuotaSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )

    def get_object(self):
        queryset = self.get_queryset()
        obj = queryset.get(user=self.request.user)
        return obj


class UserQuotaUsageView(APIView):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )

    def get(self, request, format=None):
        quota = UserQuota.objects.get(user=request.user)
        projects = Project.objects.filter(owner=request.user)
        usage = {
            'user': {
                'username': request.user.username,
                'storage': {
                    'used': File.objects.filter(project__in=projects).aggregate(
                        used=Coalesce(Sum('size'),0))['used'],
                    'available': quota.total_space_per_user
                },
            },            
        }
        project_uuid = request.query_params.get('project', None)
        if project_uuid is not None:
            projects = projects.filter(uuid=project_uuid)
        projects_data = []
        for p in projects:
            related_estimators = Estimator.objects.filter(project=p)
            uuids = list(map(lambda x: str(x), Estimator.objects.filter(project=p).values_list('uuid', flat=True)))
            project_quota = {
                'name': p.name,
                'uuid': p.uuid,
                'estimators': {
                    'count': related_estimators.count(),
                    'limit': quota.max_estimator_per_project,
                },
                'tasks': Task.objects.filter(internal_metadata__estimator__in=uuids).count(),
                'files': File.objects.filter(project=p).count()
            }
            projects_data.append(project_quota)
        usage['projects'] = projects_data
        return Response(usage)