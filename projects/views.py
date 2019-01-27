from django.contrib.auth.models import User
from rest_framework import status, viewsets, permissions, mixins
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginUserSerializer, UserSerializer
from .permissions import UserPermission


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (
        permissions.IsAuthenticated,
        UserPermission,
    )

    def get_queryset(self):
        # If logged-in user is not admin, filter by the current user
        user = self.request.user
        if user.is_staff:
            return self.queryset
        else:
            return self.queryset.filter(id=user.id)


class ExampleView(APIView):
    def get(self, request, format=None):
        return Response(status=status.HTTP_204_NO_CONTENT)
