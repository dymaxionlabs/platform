from django.shortcuts import render
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
        projects = Project.objects.filter(owners=request.user)
        projects_data = []
        for p in projects:
            project_quota = {
                'name': p.name,
                'total_storage': quota.total_space_per_project,
                'used_storage': File.objects.filter(project=p).aggregate(Sum('size')),
                'total_estimators': quota.max_estimator_per_project,
                'created_estimators': Estimator.objects.filter(project=p).count()
            }
            projects_data.append(project_quota)
        usage = {
            'user': request.user,
            'projects': projects_data,
        }
        return Response(usage)