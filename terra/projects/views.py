import django_rq
import rest_auth.serializers
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.utils.translation import ugettext_lazy as _
from django.views import View
from mailchimp3 import MailChimp
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView

from .mixins import ProjectRelatedModelListMixin, allowed_projects_for
from .models import (Layer, Map, Project, ProjectInvitationToken, UserAPIKey,
                     UserProfile)
from .permissions import (HasAccessToAPIKeyPermission,
                          HasAccessToMapPermission,
                          HasAccessToProjectPermission,
                          HasAccessToRelatedProjectPermission, HasUserAPIKey,
                          UserPermission, UserProfilePermission)
from .serializers import (ContactSerializer, LayerSerializer, MapSerializer,
                          ProjectInvitationTokenSerializer, ProjectSerializer,
                          SubscribeBetaSerializer, UserAPIKeySerializer,
                          UserProfileSerializer, UserSerializer)


class RelatedProjectAPIView(APIView):
    def get_project(self):
        user = self.request.user

        project = None
        if hasattr(self.request, 'project'):
            project = self.request.project

        project_param = self.request.query_params.get('project', None)
        if project_param:
            projects_qs = allowed_projects_for(Project.objects, user)
            project = projects_qs.filter(uuid=project_param).first()
            if not project:
                raise ValidationError(
                    {'project': 'Project invalid or not found'})

        if not project:
            raise ValidationError({'project': 'Field is not present'})

        return project


class UserViewSet(mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                  viewsets.GenericViewSet):
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


class UserProfileViewSet(mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                         viewsets.GenericViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = (
        permissions.IsAuthenticated,
        UserProfilePermission,
    )
    lookup_field = 'user__username'


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
        return Response({
            'detail': _('ok'),
            'project': invitation.project.uuid
        },
                        status=status.HTTP_200_OK)


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
        list_id = settings.MAILCHIMP_AUDIENCE_IDS['default']

        if 'landing' in request.data:
            landing = request.data['landing']
        else:
            landing = 'none'

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
                if '\'title\': \'Member Exists\'' in str(e):
                    return Response({"detail": _("User already subscribed")},
                                    status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"detail": _("Error subscribing user")},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"detail": _("User subscribed")},
                            status=status.HTTP_200_OK)


class SubscribeApiBetaView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
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
                        'tags': ['api-beta']
                    })
                return Response({"detail": _("User subscribed")},
                                status=status.HTTP_200_OK)
            except Exception as e:
                if '\'title\': \'Member Exists\'' in str(e):
                    return Response({"detail": _("User already subscribed")},
                                    status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"detail": _("Error subscribing user")},
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
                if '\'title\': \'Member Exists\'' in str(e):
                    return Response({"detail": _("User already subscribed")},
                                    status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"detail": _("Error subscribing user")},
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

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(owner=user, collaborators=[user])


class MapViewSet(ProjectRelatedModelListMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Map.objects.all().order_by('-created_at')
    serializer_class = MapSerializer
    permission_classes = (permissions.AllowAny, HasAccessToMapPermission)
    lookup_field = 'uuid'

    def get_queryset(self):
        res = super().get_queryset().distinct()

        # If not requesting a specific project_uuid, include *all* public maps
        project_uuid = self.request.query_params.get('project', None)
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


class UserAPIKeyViewSet(generics.ListCreateAPIView, mixins.UpdateModelMixin):
    queryset = UserAPIKey.objects.get_usable_keys()
    serializer_class = UserAPIKeySerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToAPIKeyPermission)
    lookup_field = 'prefix'

    def list(self, request):
        queryset = self.get_queryset().filter(user=request.user)
        project_uuid = self.request.query_params.get('project', None)
        if project_uuid:
            project = Project.objects.filter(uuid=project_uuid).first()
            if not project:
                raise ValidationError({'project': 'Project not found'})
            queryset = queryset.filter(project=project)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        project = Project.objects.filter(uuid=request.data['project']).first()
        if not project:
            raise ValidationError({'project': 'Project not found'})
        api_key, key = UserAPIKey.objects.create_key(name=request.data['name'],
                                                     user=request.user,
                                                     project=project)
        serializer = self.serializer_class(api_key)
        return Response({**serializer.data, 'key': key})

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class TilesView(View):
    def get(self, request):
        return HttpResponse('nothing', status=status.HTTP_200_OK)
