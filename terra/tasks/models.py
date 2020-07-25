from django.utils import timezone

import django_rq
from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils.translation import ugettext_lazy as _

from projects.models import Project

from . import signals, states


class Task(models.Model):
    TASK_STATE_CHOICES = sorted(zip(states.ALL_STATES, states.ALL_STATES))

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
    def status(self):
        return self.metadata and 'status' in self.metadata and self.metadata[
            'status']

    @property
    def artifacts_url(self):
        return '{job_dir}/artifacts/'.format(job_dir=self.job_dir)

    @property
    def job_dir(self):
        return 'gs://{bucket}/{project_id}/{pk}'.format(
            bucket=settings.ESTIMATORS_BUCKET,
            project_id=self.project.id,
            pk=self.pk)

    @property
    def duration(self):
        """
        Returns the duration of a stopped task, in seconds

        If the task is still running or pending, returns None.

        """
        if self.has_stopped():
            return abs(self.finished_at - self.created_at).seconds

    def start(self):
        if self.state == states.PENDING:
            django_rq.enqueue(self.name, self.id, self.args, self.kwargs)
            self.state = states.STARTED
            self.save(update_fields=['state', 'updated_at'])
            signals.task_started.send(sender=self.__class__, task=self)
            return True
        return False

    def retry(self):
        if not self.state == states.FAILED:
            raise RuntimeError("Cannot retry a task that has not failed")
        self.state = states.PENDING
        self.traceback = None
        self.save(update_fields=['state', 'traceback', 'updated_at'])
        self.start()

    def cancel(self):
        # TODO
        pass

    def is_pending(self):
        return self.state == states.PENDING

    def is_running(self):
        return self.state == states.STARTED

    def has_stopped(self):
        return self.state in [states.FINISHED, states.FAILED, states.CANCELED]

    def has_finished(self):
        return self.state == states.FINISHED

    def has_failed(self):
        return self.state == states.FAILED

    def has_been_canceled(self):
        return self.state == states.CANCELED

    def update_status(self, status):
        if self.metadata is None:
            self.metadata = {}
        self.metadata['status'] = str(status)
        self.save(update_fields=['metadata', 'updated_at'])

    def mark_as_finished(self):
        self._mark_as(states.FINISHED)
        signals.task_finished.send(sender=self.__class__, task=self)

    def mark_as_canceled(self):
        self._mark_as(states.CANCELED)
        signals.task_canceled.send(sender=self.__class__, task=self)

    def mark_as_failed(self):
        self._mark_as(states.FAILED)
        signals.task_failed.send(sender=self.__class__, task=self)

    def _mark_as(self, state):
        """Mark a Task as stopped with a state (FINISHED, FAILED, CANCELED)"""
        self.state = state
        self.finished_at = timezone.now()
        self.save(update_fields=['state', 'finished_at', 'updated_at'])


class TaskLogEntry(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    logged_at = models.DateTimeField()
    log = JSONField()
