from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions, views, viewsets
from rest_framework.views import Response

from projects.permissions import HasUserAPIKey

from .models import LogEntry
from .serializers import LogEntrySerializer


class LogEntryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogEntry.objects.all().order_by('-datetime')
    serializer_class = LogEntrySerializer
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated]

    # Filter by currently logged in user
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class AvailableCreditsView(views.APIView):
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated]

    @swagger_auto_schema(manual_parameters=[],
                         responses={
                             200: openapi.Response('Available credits'),
                         })
    def get(self, request):
        user = request.user
        return Response(dict(available=LogEntry.available_credits(user)))
