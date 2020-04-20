from datetime import datetime

import django_rq
from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils.translation import ugettext_lazy as _

from projects.models import Project
from . import states


class Task(models.Model):
    ALL_STATES = sorted(
        ['PENDING', 'STARTED', 'PROGRESS', 'FINISHED', 'FAILED'])
    TASK_STATE_CHOICES = sorted(zip(ALL_STATES, ALL_STATES))

    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    name = models.CharField(_('name'), null=True, max_length=255)
    args = models.TextField(_('arguments'), null=True)
    kwargs = models.TextField(_('keyword arguments'), null=True)
    state = models.CharField(_('state'),
                             max_length=50,
                             default=states.PENDING,
                             choices=TASK_STATE_CHOICES)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    finished_at = models.DateTimeField(_('finished at'), null=True)
    metadata = JSONField(null=True, blank=True)
    traceback = models.TextField(_('traceback'), blank=True, null=True)
    internal_metadata = JSONField(null=True, blank=True)

    @property
    def artifacts_url(self):
        return 'gs://{bucket}/{project_id}/{pk}/'.format(
            bucket=settings.ESTIMATORS_BUCKET,
            project_id=self.project.id,
            pk=self.pk)

    def start(self):
        if self.state == states.PENDING:
            django_rq.enqueue(self.name, *self.args, **self.kwargs)
            self.state = states.STARTED
            self.save(update_fields=['state', 'updated_at'])
            return True
        return False

    def retry(self):
        if not self.state == states.FAILED:
            raise RuntimeError("Cannot retry a task that has not failed")
        self.state = states.PENDING
        self.traceback = None
        self.save(update_fields=['state', 'traceback', 'updated_at'])
        self.start()

    def is_running(self):
        return self.state == states.PROGRESS

    def has_finished(self):
        return self.state == status.FINISHED

    def has_failed(self):
        return self.state == status.FAILED
