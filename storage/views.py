from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView, Response
from rest_framework import status

from projects.mixins import allowed_projects_for
from projects.models import Project
from projects.permissions import HasUserAPIKey

from .client import Client
from .serializers import FileSerializer


class List(APIView):
    """
    View to list all files in the projects container
    """

    permission_classes = [HasUserAPIKey | IsAuthenticated]

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter(
            'path',
            openapi.IN_QUERY,
            description="Path where to list files. Can be a glob pattern",
            type=openapi.TYPE_STRING)
    ],
                         responses={
                             200: FileSerializer(many=True),
                             204: openapi.Response('No files'),
                             400:
                             openapi.Response('Invalid project or not found')
                         })
    def get(self, request, format=None):
        """
        Return a list of all files
        """
        user = request.user

        if hasattr(request, 'project'):
            project = request.project

        project_param = request.query_params.get('project', None)
        if project_param:
            projects_qs = allowed_projects_for(Project.objects, user)
            project = projects_qs.filter(uuid=project_param).first()
            if not project:
                raise ValidationError(
                    {'project': 'Project invalid or not found'})

        if not project:
            raise ValidationError({'project': 'Field is not present'})

        # TODO Pagination

        path = request.query_params.get('path', '')

        client = Client(project)
        files = client.list_files(path)

        if not files:
            return Response(files, status=status.HTTP_204_NO_CONTENT)

        return Response(files)
