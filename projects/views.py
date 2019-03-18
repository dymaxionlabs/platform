from django.contrib.auth.models import User
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _
from guardian.shortcuts import get_objects_for_user
from rest_auth.registration.views import RegisterView
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Image, Layer, Map, Project, ProjectInvitationToken
from .permissions import (ProjectAssociationPermission, ProjectPermission,
                          UserPermission)
from .serializers import (ContactSerializer, ImageSerializer, LayerSerializer,
                          LoginUserSerializer, MapSerializer,
                          ProjectInvitationTokenSerializer, ProjectSerializer,
                          UserSerializer)


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


# class ProjectInvitationTokenViewSet(viewsets.ModelViewSet):
#     queryset = ProjectInvitationToken.objects.all()
#     serializer_class = ProjectInvitationTokenSerializer
#     permission_classes = (permissions.Is, )

#     def get_queryset(self):
#         # If logged-in user is not admin, filter by the current user
#         user = self.request.user
#         if user.is_staff:
#             return self.queryset.all()
#         else:
#             return self.queryset.filter(id=user.id).all()


class ProjectInvitationTokenViewSet(mixins.RetrieveModelMixin,
                                    viewsets.GenericViewSet):
    queryset = ProjectInvitationToken.objects.all()
    serializer_class = ProjectInvitationTokenSerializer
    permission_classes = (permissions.AllowAny, )


# FIXME Refactor (createapiview)
class ConfirmProjectInvitationView(APIView):
    def post(self, request, key):
        invitation = ProjectInvitationToken.objects.get(key=key)
        invitation.confirm_for(request.user)
        return Response({'detail': _('ok')}, status=status.HTTP_200_OK)


class TestAuthView(APIView):
    def get(self, request):
        return Response({"detail": _("Nothing")}, status=status.HTTP_200_OK)


class TestErrorView(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request):
        raise RuntimeError('Oops')


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


class ProjectViewSet(viewsets.ModelViewSet):
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
            cond = Q(owners=user) | Q(groups__user=user)
            return (self.queryset.filter(cond) | get_objects_for_user(
                user, 'projects.view_project')).distinct().all()


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
            cond = Q(owners=user) | Q(groups__user=user)
            projects = (Project.objects.filter(cond) | get_objects_for_user(
                user, 'projects.view_project')).distinct()
            return self.queryset.filter(project__in=projects).distinct().all()


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
            cond = Q(owners=user) | Q(groups__user=user)
            projects = (Project.objects.filter(cond) | get_objects_for_user(
                user, 'projects.view_project')).distinct()
            return self.queryset.filter(project__in=projects).distinct().all()


class ImageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                   mixins.DestroyModelMixin, mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = (permissions.IsAuthenticated, )

    lookup_field = 'name'

    def get_queryset(self):
        # Only return files from auth user
        user = self.request.user
        return self.queryset.filter(owner=user).all()


class ImageUploadView(APIView):
    parser_classes = (FileUploadParser, )
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request, filename, format=None):
        image = Image(name=filename, owner=request.user)
        image.file = request.data['file']
        image.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
