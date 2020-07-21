from django.shortcuts import render
from rest_framework import generics, permissions
from projects.permissions import HasUserAPIKey
from .models import UserQuota
from .serializers import UserQuotaSerializer


class UserQuotaView(generics.RetrieveAPIView):
    queryset = UserQuota.objects.all()
    serializer_class = UserQuotaSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )

    def get_object(self):
        queryset = self.get_queryset()
        obj = queryset.get(user=self.request.user)
        return obj