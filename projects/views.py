from django.contrib.auth.models import User
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _
from guardian.shortcuts import get_objects_for_user
from rest_auth.registration.views import RegisterView
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView

from .models import File, Layer, Map, Project, ProjectInvitationToken
from .permissions import (HasAccessToMapPermission,
                          HasAccessToProjectPermission,
                          HasAccessToRelatedProjectFilesPermission,
                          HasAccessToRelatedProjectPermission, UserPermission)
from .serializers import (ContactSerializer, FileSerializer, LayerSerializer,
                          LoginUserSerializer, MapSerializer,
                          ProjectInvitationTokenSerializer, ProjectSerializer,
                          UserSerializer)


def allowed_projects_for(project_queryset, user):
    if user.is_staff:
        return project_queryset.all()
    elif not user.is_anonymous:
        # NOTE groups condition is deprecated
        cond = Q(owners=user) | Q(groups__user=user)
        return (project_queryset.filter(cond)
                | get_objects_for_user(
                    user, 'projects.view_project')).distinct().all()


class ProjectRelatedModelListMixin:
    def get_queryset(self):
        user = self.request.user

        if user.is_anonymous:
            return self.queryset.none()

        projects_qs = allowed_projects_for(Project.objects, user)

        # Filter by uuid, if present
        project_uuid = self.request.query_params.get('project_uuid', None)
        if project_uuid is not None:
            project = projects_qs.filter(uuid=project_uuid).first()
            return self.queryset.filter(project=project).all()

        return self.queryset.filter(project__in=projects_qs).distinct().all()


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


class ContactView(generics.GenericAPIView):
    serializer_class = ContactSerializer
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": _("Contact message has been sent")},
                        status=status.HTTP_200_OK)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-updated_at')
    serializer_class = ProjectSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToProjectPermission)
    lookup_field = 'uuid'

    def get_queryset(self):
        # Filter only projects that user has access to
        user = self.request.user
        return allowed_projects_for(self.queryset, user)


class MapViewSet(ProjectRelatedModelListMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Map.objects.all().order_by('-created_at')
    serializer_class = MapSerializer
    permission_classes = (permissions.AllowAny, HasAccessToMapPermission)
    lookup_field = 'uuid'

    def get_queryset(self):
        res = super().get_queryset().distinct()

        # If not requesting a specific project_uuid, include *all* public maps
        project_uuid = self.request.query_params.get('project_uuid', None)
        if project_uuid is None:
            res = (res | self.queryset.filter(
                extra_fields__public=True).distinct()).distinct()

        return res.all()


class LayerViewSet(ProjectRelatedModelListMixin,
                   viewsets.ReadOnlyModelViewSet):
    queryset = Layer.objects.all().order_by('-created_at')
    serializer_class = LayerSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)
    lookup_field = 'uuid'


class FileViewSet(ProjectRelatedModelListMixin, mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin, mixins.DestroyModelMixin,
                  mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = File.objects.all().order_by('-created_at')
    serializer_class = FileSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectFilesPermission)

    lookup_field = 'name'

    def get_queryset(self):
        # Also return files from user that are not associated with a project
        # (backwards-compatibility)

        user = self.request.user
        projects_qs = allowed_projects_for(Project.objects, user)

        # Filter by uuid, if present
        project_uuid = self.request.query_params.get('project_uuid', None)
        if project_uuid is not None:
            project = projects_qs.filter(uuid=project_uuid).first()
            return self.queryset.filter(
                Q(project=project) | Q(owner=user, project=None)).all()

        return self.queryset.filter(
            Q(project__in=projects_qs)
            | Q(owner=user, project=None)).distinct().all()


# FIXME Use CreateAPIView and a serializer for consistent validation
class FileUploadView(APIView):
    parser_classes = (FileUploadParser, )
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request, filename, format=None):
        user = self.request.user

        project = None
        uuid = self.request.query_params.get('project_uuid', None)
        if not uuid:
            raise ValidationError({'project_uuid': 'Field not present'})

        projects_qs = allowed_projects_for(Project.objects, user)
        project = projects_qs.filter(uuid=uuid).first()
        if not project:
            raise ValidationError({'project_uuid': 'Invalid project uuid'})

        file = File(name=filename, owner=request.user, project=project)
        file.file = request.data['file']
        file.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
