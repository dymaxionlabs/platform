import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from django.conf import settings
from django.db.models import Q
from django.http import FileResponse
from django.shortcuts import render
from google.cloud import storage as gcs
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.mixins import ProjectRelatedModelListMixin
from projects.permissions import (HasAccessToRelatedProjectPermission,
                                  HasUserAPIKey)
from tasks.models import Task
from tasks.serializers import TaskSerializer


class TaskViewSet(ProjectRelatedModelListMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Task.objects.all().order_by('-finished_at', '-created_at')
    serializer_class = TaskSerializer
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)


class DownloadArtifactsAPIView(APIView):
    def get(self, request, id):
        """
        Downloads all artifacts from a task in a zip file
        """
        # Get task
        task = Task.objects.get(pk=id)
        if not task:
            return NotFound(detail='Task not found')

        # Get list of all artifact files (blobs)
        client = gcs.Client()
        prefix = f'{task.artifacts_path}'
        blobs = client.list_blobs(settings.TASK_ARTIFACTS_BUCKET,
                                  prefix=prefix)

        # If there are no blobs, return 204
        if not blobs:
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Create a named temporary file for zip file
        artifacts_zipfile = tempfile.NamedTemporaryFile(suffix='.zip')
        z = zipfile.ZipFile(artifacts_zipfile.name,
                            mode='w',
                            compression=zipfile.ZIP_DEFLATED)

        # For each blob, download to temp file and write to zipfile
        for blob in blobs:
            blob_path = blob.name.split(f'{prefix}/')[1]
            with tempfile.NamedTemporaryFile() as tmp:
                blob.download_to_filename(tmp.name)
                z.write(tmp.name, blob_path)

        z.close()
        return FileResponse(open(artifacts_zipfile.name, 'rb'))
