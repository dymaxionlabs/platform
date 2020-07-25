from datetime import datetime, timezone

from django.conf import settings
from django.db.models import Q
from django.shortcuts import render
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.mixins import ProjectRelatedModelListMixin
from projects.permissions import (HasAccessToRelatedProjectPermission,
                                  HasUserAPIKey)
from tasks.models import Task
from tasks.serializers import TaskSerializer


class TaskViewSet(ProjectRelatedModelListMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Task.objects.all().order_by('-finished_at', '-created_at')
    serializer_class = TaskSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)
