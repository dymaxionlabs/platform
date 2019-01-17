from django.contrib.auth import login
from django.contrib.auth.models import User
from knox.auth import TokenAuthentication
from knox.views import LoginView as KnoxLoginView
from rest_framework import status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginUserSerializer, UserSerializer


class LoginView(KnoxLoginView):
    permission_classes = (AllowAny, )

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class ExampleView(APIView):
    def get(self, request, format=None):
        return Response(status=status.HTTP_204_NO_CONTENT)
