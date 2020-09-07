from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions, views, viewsets
from rest_framework.views import Response
from rest_framework.exceptions import ParseError
from django.conf import settings

from projects.permissions import HasUserAPIKey

from .models import LogEntry
from .serializers import LogEntrySerializer
from .clients import StripeClient


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


class BuyPackView(views.APIView):
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated]

    # @swagger_auto_schema(manual_parameters=[],
    #                      responses={
    #                          200: openapi.Response('Checkout session id'),
    #                      })
    def post(self, request, pack_id):
        user = request.user
        success_url = self.request.query_params.get('success_url', '')
        cancel_url = self.request.query_params.get('cancel_url', '')

        if not success_url:
            raise ParseError('success_url is missing')
        if not cancel_url:
            raise ParseError('cancel_url is missing')

        client = StripeClient(user.username)
        session = client.create_pack_checkout_session(pack_id,
                                                      success_url=success_url,
                                                      cancel_url=cancel_url)
        return Response(dict(session_id=session.id))
