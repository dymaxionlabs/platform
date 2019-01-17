#from django.contrib.auth import login
#from django.contrib.auth.models import User
from rest_framework import status
#from rest_framework.authtoken.serializers import AuthTokenSerializer
#from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginUserSerializer, UserSerializer


class ExampleView(APIView):
    def get(self, request, format=None):
        return Response(status=status.HTTP_204_NO_CONTENT)
