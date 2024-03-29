import mimetypes
import tempfile

import requests
from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from fnmatch import fnmatch
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import NotFound, ParseError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.reverse import reverse
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView, Response

from quotas.models import UserQuota
from projects.mixins import allowed_projects_for
from projects.models import Project
from projects.permissions import HasUserAPIKey
from projects.renderers import BinaryFileRenderer
from projects.views import RelatedProjectAPIView

from .client import GCSClient
from .serializers import FileSerializer
from .models import File


class StorageAPIView(RelatedProjectAPIView):
    permission_classes = [HasUserAPIKey | IsAuthenticated]

    def get_client(self):
        project = self.get_project()
        return GCSClient(project)


class ListFilesView(RelatedProjectAPIView):
    """
    View to list all files in the projects container
    """
    queryset = File.objects.filter(complete=True)
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
        clean_path = path.lstrip(" /").rstrip()
        prefix = clean_path.split("*")[0]
        files = self.queryset.filter(project=project, path__startswith=prefix)
        response_status = status.HTTP_204_NO_CONTENT if files.first(
        ) is None else status.HTTP_200_OK
        match_files = (f for f in files if fnmatch(f.path, clean_path))
        return Response(FileSerializer(match_files, many=True).data,
                        status=response_status)


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
        openapi.Parameter('project',
                          openapi.IN_QUERY,
                          description="Project ID",
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
        metadata = request.data.get('metadata', {})
        project = self.get_project()

        file = File.upload_from_file(
            fileobj, 
            path=path, 
            project=project, 
            metadata=metadata
        )

        return Response(dict(detail=FileSerializer(file).data),
                        status=status.HTTP_200_OK)


class FileView(StorageAPIView):

    queryset = File.objects.filter(complete=True)

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
        project = self.get_project()
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")

        file = self.queryset.filter(path=path, project=project).first()
        if file is None:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        content = FileSerializer(file).data
        return Response(dict(detail=content), status=status.HTTP_200_OK)

    def delete(self, request, format=None):
        """
        Delete a file.
        """
        project = self.get_project()
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        file = self.queryset.filter(path=path, project=project).first()
        if file is None:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        file.delete()
        return Response(dict(detail='File deleted.'),
                        status=status.HTTP_200_OK)


class DownloadFileView(StorageAPIView):
    renderer_classes = (BinaryFileRenderer, )

    def get(self, request):
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")
        project = self.get_project()

        try:
            file = File.objects.get(path=path, project=project)
        except File.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        with tempfile.NamedTemporaryFile() as tmpfile:
            src = tmpfile.name
            file.download_to_filename(src)

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
        if not size:
            raise ParseError("'size' missing")
        else:
            size = int(size)
        metadata = request.data.get('metadata', {})

        File.check_quota(request.user, size)

        client = self.get_client()
        session_url = client.create_resumable_upload_session(
            to=path, size=size, content_type=request.content_type)
        File.objects.update_or_create(project=self.get_project(),
                                   path=path,
                                   defaults={
                                       'size': size,
                                       'complete': False,
                                       'metadata': metadata,
                                   })
        return Response(dict(session_url=session_url),
                        status=status.HTTP_200_OK)


class CheckCompletedFileView(StorageAPIView):
    def post(self, request):
        path = request.query_params.get('path', None)
        if not path:
            raise ParseError("'path' missing")

        file = File.objects.filter(project=self.get_project(),
                                   path=path, 
                                   complete=False,
                                   ).first()
        if not file:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

        file.complete = True
        file.save()

        content = FileSerializer(file).data
        return Response(dict(detail=content), status=status.HTTP_200_OK)
