import mimetypes
import os
import shutil
import tempfile
import django_rq

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _
from mailchimp3 import MailChimp
from rest_auth.registration.views import RegisterView
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

from .mixins import ProjectRelatedModelListMixin, allowed_projects_for
from .models import (File, Layer, Map, Project, ProjectInvitationToken,
                     UserProfile, UserAPIKey)
from .permissions import (HasAccessToMapPermission,
                          HasAccessToProjectPermission,
                          HasAccessToRelatedProjectFilesPermission,
                          HasAccessToRelatedProjectPermission, UserPermission,
                          UserProfilePermission, HasUserAPIKey,
                          HasAccessToAPIKeyPermission)
from .renderers import BinaryFileRenderer
from .serializers import (ContactSerializer, FileSerializer, LayerSerializer,
                          LoginUserSerializer, MapSerializer,
                          ProjectInvitationTokenSerializer, ProjectSerializer,
                          SubscribeBetaSerializer, UserProfileSerializer,
                          UserSerializer, UserAPIKeySerializer)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (
        permissions.IsAuthenticated,
        UserPermission,
    )
    lookup_field = 'username'

    def get_queryset(self):
        # If logged-in user is not admin, filter by the current user
        user = self.request.user
        if user.is_staff:
            return self.queryset.all()
        else:
            return self.queryset.filter(id=user.id).all()


class UserProfileViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = (
        permissions.IsAuthenticated,
        UserProfilePermission,
    )
    lookup_field = 'user__username'


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


class TestTaskErrorView(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request):
        django_rq.enqueue('projects.tasks.test_fail')
        return Response({"detail": _("Nothing")}, status=status.HTTP_200_OK)


class ContactView(generics.GenericAPIView):
    serializer_class = ContactSerializer
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        email = request.data['email']
        landing = request.data['landing']
        list_id = settings.MAILCHIMP_AUDIENCE_IDS['default']

        if settings.MAILCHIMP_APIKEY is not None:
            client = MailChimp(mc_api=settings.MAILCHIMP_APIKEY,
                               mc_user=settings.MAILCHIMP_USER)
            try:
                client.lists.members.create(
                    list_id, {
                        'email_address': email,
                        'status': 'subscribed',
                        'tags': [landing]
                    })
                return Response({"detail": _("User subscribed")},
                                status=status.HTTP_200_OK)
            except Exception as e:
                print(str(e))
                return Response({"detail": _("Error subscribing user")},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"detail": _("User subscribed")},
                            status=status.HTTP_200_OK)


class SubscribeBetaView(generics.GenericAPIView):
    serializer_class = SubscribeBetaSerializer
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        email = request.data['email']
        list_id = settings.MAILCHIMP_AUDIENCE_IDS['default']

        if settings.MAILCHIMP_APIKEY is not None:
            client = MailChimp(mc_api=settings.MAILCHIMP_APIKEY,
                               mc_user=settings.MAILCHIMP_USER)
            try:
                client.lists.members.create(
                    list_id, {
                        'email_address': email,
                        'status': 'subscribed',
                        'tags': ['newsletter-landing']
                    })
                return Response({"detail": _("User subscribed")},
                                status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"detail": _("Error subscribing user")},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"detail": _("User subscribed")},
                            status=status.HTTP_200_OK)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-updated_at')
    serializer_class = ProjectSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
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
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
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
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )

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

        filename = File.prepare_filename(filename)

        file = File(name=filename, owner=request.user, project=project)
        file.file = request.data['file']
        file.save()
        serializer = FileSerializer(file)
        return Response({'detail': serializer.data}, status=status.HTTP_200_OK)


class FileDownloadView(APIView):

    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated, )
    renderer_classes = (BinaryFileRenderer, )

    def get(self, request, filename):
        user = self.request.user
        uuid = self.request.query_params.get('project_uuid', None)
        if not uuid:
            raise ValidationError({'project_uuid': 'Field not present'})
        project = Project.objects.filter(uuid=uuid).first()
        if not project:
            raise ValidationError({'project_uuid': 'Invalid project uuid'})

        filters = dict(name=filename, project=project)
        if not user.is_staff:
            filters.update(owner=user)
        file = File.objects.filter(**filters).first()

        if not file:
            raise NotFound(detail=None, code=None)

        with tempfile.NamedTemporaryFile() as tmpfile:
            shutil.copyfileobj(file.file, tmpfile)
            src = tmpfile.name

            content_disp = 'attachment; filename="{file_name}"'.format(
                file_name=filename)

            with open(src, 'rb') as fileresponse:
                return Response(
                    fileresponse.read(),
                    headers={'Content-Disposition': content_disp},
                    content_type=mimetypes.MimeTypes().guess_type(src)[0])


class UserAPIKeyList(generics.ListCreateAPIView, mixins.UpdateModelMixin):
    queryset = UserAPIKey.objects.get_usable_keys()
    serializer_class = UserAPIKeySerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToAPIKeyPermission)
    lookup_field = 'prefix'

    def list(self, request):
        queryset = self.get_queryset().filter(user=request.user)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        api_key, key = UserAPIKey.objects.create_key(name=request.data['name'],
                                                     user=request.user)
        serializer = self.serializer_class(api_key)
        return Response({'data': serializer.data, 'key': key})

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
