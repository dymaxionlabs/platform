from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Layer, Map, Project
from .permissions import (ProjectAssociationPermission, ProjectPermission,
                          UserPermission)
from .serializers import (ContactSerializer, LayerSerializer,
                          LoginUserSerializer, MapSerializer,
                          ProjectSerializer, UserSerializer)


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
            return self.queryset.all()
        else:
            return self.queryset.filter(id=user.id).all()


class ExampleView(APIView):
    def get(self, request):
        return Response({"detail": _("Nothing")}, status=status.HTTP_200_OK)


class ContactView(GenericAPIView):
    serializer_class = ContactSerializer
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": _("Contact message has been sent")}, status=status.HTTP_200_OK)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = (permissions.IsAuthenticated, ProjectPermission)
    lookup_field = 'uuid'

    def get_queryset(self):
        # Filter only projects that user has access to
        user = self.request.user
        if user.is_staff:
            return self.queryset.all()
        elif not user.is_anonymous:
            return self.queryset.filter(groups__user=user).all()


class MapViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    permission_classes = (permissions.IsAuthenticated,
                          ProjectAssociationPermission)
    lookup_field = 'uuid'

    def get_queryset(self):
        # If logged-in user is not admin, filter public maps and owned by
        # current user group.
        user = self.request.user
        if user.is_staff:
            return self.queryset.all()
        elif not user.is_anonymous:
            return self.queryset.filter(project__groups__user=user).distinct().all()


class LayerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Layer.objects.all()
    serializer_class = LayerSerializer
    permission_classes = (permissions.IsAuthenticated,
                          ProjectAssociationPermission)
    lookup_field = 'uuid'

    def get_queryset(self):
        # Filter layers from projects that user has access to
        user = self.request.user
        if user.is_staff:
            return self.queryset.all()
        elif not user.is_anonymous:
            return self.queryset.filter(project__groups__user=user).distinct().all()
