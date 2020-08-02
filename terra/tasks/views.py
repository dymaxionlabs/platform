import tempfile
import zipfile

from django.conf import settings
from django.http import FileResponse
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


class ArtifactsMixin:
    def _get_task(self, id):
        task = Task.objects.get(pk=id)
        if not task:
            return NotFound(detail='Task not found')
        return task

    def _get_artifact_blobs(self, task):
        client = gcs.Client()
        prefix = self._get_prefix(task)
        return client.list_blobs(settings.TASK_ARTIFACTS_BUCKET, prefix=prefix)

    def _get_prefix(self, task):
        # User is only interested in output artifacts, for now
        return f'{task.output_artifacts_path}'


class ListArtifactsAPIView(APIView, ArtifactsMixin):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)

    def get(self, request, id):
        task = self._get_task(id)
        blobs = self._get_artifact_blobs(task)
        files = [b.name for b in blobs]

        # Remove prefix from file names
        prefix = self._get_prefix(task)
        files = [f.split(prefix)[1] for f in files]

        return Response(dict(files=files))


class DownloadArtifactsAPIView(APIView, ArtifactsMixin):
    permission_classes = (HasUserAPIKey | permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)

    def get(self, request, id):
        """
        Downloads all artifacts from a task in a zip file
        """
        task = self._get_task(id)
        blobs = self._get_artifact_blobs(task)

        # If there are no blobs, return 204
        if not blobs:
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Create a named temporary file for zip file
        artifacts_zipfile = tempfile.NamedTemporaryFile(suffix='.zip')
        z = zipfile.ZipFile(artifacts_zipfile.name,
                            mode='w',
                            compression=zipfile.ZIP_DEFLATED)

        # For each blob, download to temp file and write to zipfile
        prefix = self._get_prefix(task)
        for blob in blobs:
            blob_path = blob.name.split(prefix)[1]
            with tempfile.NamedTemporaryFile() as tmp:
                blob.download_to_filename(tmp.name)
                z.write(tmp.name, blob_path)

        z.close()
        return FileResponse(open(artifacts_zipfile.name, 'rb'))
