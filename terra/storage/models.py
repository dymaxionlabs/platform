from django.db import models
from django.db.models import Sum
from rest_framework.exceptions import ParseError
from django.db.models.functions import Coalesce
from django.contrib.postgres.fields import JSONField
from projects.models import Project
from quotas.models import UserQuota


class File(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    path = models.CharField(max_length=512)
    size = models.IntegerField()
    complete = models.BooleanField(default=True)
    metadata = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{path} ({project})'.format(path=self.path, project=self.project)

    @classmethod
    def check_quota(cls, user, new_bytes):
        quota = UserQuota.objects.get(user=user)
        if quota.max_file_size < new_bytes:
            raise ParseError("the file size exceeds the allowed limit")

        projects = Project.objects.filter(owner=user)
        usage = File.objects.filter(project__in=projects).aggregate(total=Coalesce(Sum('size'),0))
        if quota.total_space_per_user < usage['total'] + new_bytes:
            raise ParseError("insufficient storage")