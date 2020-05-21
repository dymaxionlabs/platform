import mimetypes
import tempfile

import requests
from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, ParseError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.reverse import reverse
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView, Response

from projects.mixins import allowed_projects_for
from projects.models import Project
from projects.permissions import HasUserAPIKey
from projects.renderers import BinaryFileRenderer
from projects.views import RelatedProjectAPIView

from .client import Client
from .serializers import FileSerializer


class StorageAPIView(RelatedProjectAPIView):
    permission_classes = [HasUserAPIKey | IsAuthenticated]

    def get_client(self):
        project = self.get_project()
        return Client(project)


class ListFilesView(RelatedProjectAPIView):
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


class UploadFileView(StorageAPIView):
    """
    View for uploading a file
    """

    parser_classes = [MultiPartParser]

    manual_parameters = [
        openapi.Parameter('path',
                          openapi.IN_FORM,
                          description="File output path in storage",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('file',
                          openapi.IN_FORM,
                          description="File content",
                          type=openapi.TYPE_FILE)
    ]
    responses = {
        200: FileSerializer,
        400: openapi.Response('Bad request'),
    }

    @swagger_auto_schema(manual_parameters=manual_parameters,
                         responses=responses)
    def post(self, request, format=None):
        path = request.data.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        fileobj = request.data.get('file', None)
        if not fileobj:
            raise ParseError("'file' missing")

        client = self.get_client()
        file = client.upload_from_file(fileobj,
                                       to=path,
                                       content_type=fileobj.content_type)

        return Response(dict(detail=FileSerializer(file).data),
                        status=status.HTTP_200_OK)


class FileView(StorageAPIView):
    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter('path',
                          openapi.IN_QUERY,
                          description="File path.",
                          type=openapi.TYPE_STRING)
    ],
                         responses={
                             200: FileSerializer(many=False),
                             404: openapi.Response('File not found'),
                         })
    def get(self, request, format=None):
        """
        Return the content of a file
        """
        # TODO Pagination
        project = self.get_project()
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        client = Client(project)
        files = list(client.list_files(path))
        if not files:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        content = FileSerializer(files[0]).data
        return Response(dict(detail=content), status=status.HTTP_200_OK)

    def delete(self, request, format=None):
        """
        Delete a file.
        """
        # TODO Pagination
        project = self.get_project()
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        client = Client(project)
        files = list(client.list_files(path))
        if not files:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        files[0].delete()
        return Response(dict(detail='File deleted.'),
                        status=status.HTTP_200_OK)


class DownloadFileView(StorageAPIView):
    renderer_classes = (BinaryFileRenderer, )

    def get(self, request):
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        project = self.get_project()
        client = Client(project)
        files = list(client.list_files(path))
        if not files:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

        with tempfile.NamedTemporaryFile() as tmpfile:
            src = tmpfile.name
            files[0].download_to_filename(src)

            content_disp = 'attachment; filename="{file_name}"'.format(
                file_name=path)

            with open(src, 'rb') as fileresponse:
                data = fileresponse.read()
                return Response(
                    data,
                    headers={'Content-Disposition': content_disp},
                    content_type=mimetypes.MimeTypes().guess_type(src)[0])


class CreateResumableUploadView(StorageAPIView):
    manual_parameters = [
        openapi.Parameter('path',
                          openapi.IN_QUERY,
                          description="File path in storage",
                          type=openapi.TYPE_STRING),
        openapi.Parameter('size',
                          openapi.IN_QUERY,
                          description="Total file size in bytes (optional)",
                          type=openapi.TYPE_INTEGER),
    ]
    responses = {
        200: openapi.Response("GCS upload session URL"),
        400: openapi.Response("Bad request"),
    }

    @swagger_auto_schema(manual_parameters=manual_parameters,
                         responses=responses)
    def post(self, request):
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        size = request.query_params.get('size', None)
        if size:
            size = int(size)

        client = self.get_client()
        session_url = client.create_resumable_upload_session(
            to=path, size=size, content_type=request.content_type)

        return Response(dict(session_url=session_url),
                        status=status.HTTP_200_OK)
