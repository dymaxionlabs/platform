from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils.translation import ugettext_lazy as _

from projects.models import Project


class Task(models.Model):
    ALL_STATES = sorted(
        ['PENDING', 'STARTED', 'PROGRESS', 'FINISHED', 'FAILED'])
    TASK_STATE_CHOICES = sorted(zip(ALL_STATES, ALL_STATES))

    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    name = models.CharField(_('name'), null=True, max_length=255)
    args = models.TextField(_('arguments'), null=True)
    kwargs = models.TextField(_('keyword arguments'), null=True)
    status = models.CharField(_('state'),
                              max_length=50,
                              default='PENDING',
                              choices=TASK_STATE_CHOICES)

    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    metadata = JSONField(null=True, blank=True)
    finished_at = models.DateTimeField(_('finished at'), null=True)
    traceback = models.TextField(_('traceback'), blank=True, null=True)
    internal_metadata = JSONField(null=True, blank=True)

    @property
    def artifacts_url(self):
        return 'gs://{bucket}/{project_id}/{pk}/'.format(
            bucket=settings.ESTIMATORS_BUCKET,
            project_id=self.project.id,
            pk=self.pk)
