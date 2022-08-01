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

