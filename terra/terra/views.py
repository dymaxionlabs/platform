from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def index(request):
    return Response(status=204)


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def ping(request):
    return HttpResponse(content="PONG", status=200)
