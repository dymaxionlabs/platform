from django.conf import settings
from django.db import models
from django.db.models import Sum
from rest_framework.exceptions import ParseError
from django.db.models.functions import Coalesce
from django.contrib.postgres.fields import JSONField
from terra.utils import gsutilCopy
from projects.models import Project
from quotas.models import UserQuota
from storage.client import GCSClient


class File(models.Model):
    project = models.ForeignKey(Project,
                                on_delete=models.CASCADE,
                                related_name='files')
    path = models.CharField(max_length=512)
    size = models.BigIntegerField()
    complete = models.BooleanField(default=True)
    metadata = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{path} ({project})'.format(path=self.path,
                                           project=self.project)

    @classmethod
    def check_quota(cls, user, new_bytes):
        quota = UserQuota.objects.get(user=user)
        if quota.max_file_size < new_bytes:
            raise ParseError("the file size exceeds the allowed limit")

        projects = Project.objects.filter(owner=user)
        usage = File.objects.filter(project__in=projects).aggregate(
            total=Coalesce(Sum('size'), 0))
        if quota.total_space_per_user < usage['total'] + new_bytes:
            raise ParseError("insufficient storage")

    @classmethod
    def copy(cls, gcs_url, out_path, *, project):
        gsutilCopy(
            gcs_url.strip("/"),
            f'gs://{settings.FILES_BUCKET}/project_{project.pk}/{out_path}')
        client = GCSClient(project)
        files = list(client.list_files(f'{out_path}*'))
        for file in files:
            File.objects.get_or_create(project=project,
                                       path=file.path,
                                       defaults={
                                           'size': file.blob.size,
                                           'metadata': file.metadata
                                       })

    def download_to_filename(self, path):
        client = GCSClient(self.project)
        files = list(client.list_files(self.path))
        if files:
            files[0].download_to_filename(path)
        else:
            raise RuntimeError("File not found in storage")


    @classmethod
    def upload_from_file(cls, fileobj, path, project, metadata):
        cls.check_quota(project.owner, fileobj.size)
        client = GCSClient(project)
        storage_file = client.upload_from_file(
            fileobj, to=path, content_type=fileobj.content_type)
        file_metadata = metadata if storage_file.metadata is None else {**metadata, **storage_file.metadata}
        file, _ = File.objects.get_or_create(project=project,
                                             path=storage_file.path,
                                             defaults={
                                                 'size': fileobj.size,
                                                 'metadata': file_metadata
                                             })
        return file
