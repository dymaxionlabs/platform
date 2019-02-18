from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView

from .permissions import UserPermission
from .serializers import ContactSerializer, LoginUserSerializer, UserSerializer


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


class ExampleView(GenericAPIView):
    def get(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContactView(GenericAPIView):
    serializer_class = ContactSerializer
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "detail": _("Contact message has been sent")
        },
                        status=status.HTTP_200_OK)
