from django.contrib.auth.models import User
from knox.models import AuthToken
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .serializers import LoginUserSerializer, UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class Login(generics.GenericAPIView):
    serializer_class = LoginUserSerializer
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        print("POST!")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        return Response({
            "user":
            UserSerializer(user, context=self.get_serializer_context()).data,
            "token":
            AuthToken.objects.create(user)
        })
