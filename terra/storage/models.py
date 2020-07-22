from django.db import models
from django.contrib.postgres.fields import JSONField
from projects.models import Project


class File(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    path = models.CharField(max_length=512)
    size = models.IntegerField()
    complete = models.BooleanField(default=True)
    metadata = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{name} ({project})'.format(name=self.name,
                                        type=self.project)