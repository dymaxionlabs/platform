from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.exceptions import ParseError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView, Response

from projects.mixins import allowed_projects_for
from projects.models import Project
from projects.permissions import HasUserAPIKey
from projects.views import RelatedProjectAPIView

from .client import Client
from .serializers import FileSerializer


class StorageAPIView(RelatedProjectAPIView):
    permission_classes = [HasUserAPIKey | IsAuthenticated]

    def get_client(self):
        project = self.get_project()
        return Client(project)


class ListFile(RelatedProjectAPIView):
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
        # TODO Pagination
        project = self.get_project()
        path = request.query_params.get('path', '*')

        client = Client(project)
        files = client.list_files(path)

        files = [FileSerializer(f).data for f in files]
        if not files:
            return Response(files, status=status.HTTP_204_NO_CONTENT)
        return Response(files)


class UploadFile(StorageAPIView):
    """
    View for uploading a file
    """

    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        client = self.get_client()
        path = request.data.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        file = client.upload_from_file(request.data['file'],
                                       to=path,
                                       content_type=request.content_type)
        return Response(dict(detail=FileSerializer(file).data),
                        status=status.HTTP_200_OK)


class RetrieveFile(RelatedProjectAPIView):
    permission_classes = [HasUserAPIKey | IsAuthenticated]

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter('path',
                          openapi.IN_QUERY,
                          description="File path.",
                          type=openapi.TYPE_STRING)
    ],
                         responses={
                             200: FileSerializer(many=False),
                             204: openapi.Response('No files'),
                             400:
                             openapi.Response('Invalid project or not found')
                         })
    def get(self, request, format=None):
        """
        Return the content of a file
        """
        # TODO Pagination
        project = self.get_project()
        path = request.query_params.get('path', '')

        client = Client(project)

        if path == '':
            return Response(None, status=status.HTTP_404_NOT_FOUND)

        blob = client.bucket.blob(path)
        content = blob.download_as_string()

        return Response(content, status=status.HTTP_200_OK)
