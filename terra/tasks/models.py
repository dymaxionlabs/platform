import django_rq
from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from estimators.models import Estimator
from projects.models import Project

from . import signals, states
from .clients import CloudMLClient
from .utils import enqueue_rq_job


class Task(models.Model):
    TASK_STATE_CHOICES = sorted(zip(states.ALL_STATES, states.ALL_STATES))

    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    name = models.CharField(_("name"), max_length=255)
    args = JSONField(_("arguments"), default=list)
    kwargs = JSONField(_("keyword arguments"), default=dict)
    state = models.CharField(
        _("state"), max_length=50, default=states.PENDING, choices=TASK_STATE_CHOICES
    )
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)
    finished_at = models.DateTimeField(_("finished at"), null=True, blank=True)
    metadata = JSONField(_("metadata"), default=dict)
    error = models.TextField(_("error"), blank=True, null=True)
    estimated_duration = models.PositiveIntegerField(
        _("estimated duration"), blank=True, null=True
    )
    internal_metadata = JSONField(_("internal metadata"), default=dict)

    def __str__(self):
        return f"{self.name}({self.args}, {self.kwargs})"

    @property
    def status(self):
        return self.metadata.get("status")

    @property
    def artifacts_url(self):
        return f"gs://{settings.TASK_ARTIFACTS_BUCKET}/{self.artifacts_path}"

    @property
    def artifacts_path(self):
        return f"{self.project.pk}/{self.pk}"

    @property
    def input_artifacts_url(self):
        return f"{self.artifacts_url}/input/"

    @property
    def output_artifacts_url(self):
        return f"{self.artifacts_url}/output/"

    @property
    def input_artifacts_path(self):
        return f"{self.artifacts_path}/input/"

    @property
    def output_artifacts_path(self):
        return f"{self.artifacts_path}/output/"

    @property
    def cloudml_job_url(self):
        return f"{self.artifacts_url}/cloudml/"

    @property
    def duration(self):
        """
        Returns the duration of a stopped task, in seconds

        If the task is still running or pending, returns None.

        """
        if self.has_stopped():
            return abs(self.finished_at - self.created_at).seconds

    @property
    def age(self):
        """
        Returns task age in seconds

        """
        return (timezone.now() - self.created_at).seconds

    @property
    def can_be_cancelled(self):
        """
        Returns True if the task can be cancelled

        """
        return self.name in [Estimator.TRAINING_JOB_TASK, Estimator.PREDICTION_JOB_TASK]

    def start(self):
        if self.state == states.PENDING:
            enqueue_rq_job(self.name, self.pk)
            self.state = states.STARTED
            self.save(update_fields=["state", "updated_at"])
            signals.task_started.send(sender=self.__class__, task=self)
            return True
        return False

    def retry(self):
        if not self.state == states.FAILED:
            raise RuntimeError("Cannot retry a task that has not failed")
        self.state = states.PENDING
        self.traceback = None
        self.save(update_fields=["state", "traceback", "updated_at"])
        self.start()

    def cancel(self):
        if self.can_be_cancelled:
            if self.state in [states.CANCELED, states.FINISHED, states.FAILED]:
                raise RuntimeError("Cannot cancel an already completed job")
            if (
                self.internal_metadata is not None
                and "cloudml_job_name" in self.internal_metadata
            ):
                client = CloudMLClient()
                client.cancel_job(self.internal_metadata["cloudml_job_name"])
                self.state = states.CANCELED
                self.save(update_fields=["state", "updated_at"])
            else:
                raise RuntimeError("Cloudml job name is not setted")
        else:
            raise RuntimeError("This task can not be canceled")

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
        self.metadata["status"] = str(status)
        self.save(update_fields=["metadata", "updated_at"])

    def mark_as_in_progress(self):
        self._mark_as(states.PROGRESS)
        signals.task_progress.send(sender=self.__class__, task=self)

    def mark_as_finished(self, finished_at=None):
        self._mark_as(states.FINISHED, finished_at=finished_at)
        signals.task_finished.send(sender=self.__class__, task=self)

    def mark_as_canceled(self, finished_at=None):
        self._mark_as(states.CANCELED, finished_at=finished_at)
        signals.task_canceled.send(sender=self.__class__, task=self)

    def mark_as_failed(self, reason=None, finished_at=None):
        self._mark_as(states.FAILED, finished_at=finished_at)
        self.error = reason
        self.save(update_fields=["error", "updated_at"])
        signals.task_failed.send(sender=self.__class__, task=self)

    def _mark_as(self, state, finished_at=None):
        """Mark a Task as stopped with a state (FINISHED, FAILED, CANCELED)"""
        self.state = state
        self.finished_at = finished_at or timezone.now()
        self.save(update_fields=["state", "finished_at", "updated_at"])


class TaskLogEntry(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    logged_at = models.DateTimeField()
    log = JSONField()

    class Meta:
        verbose_name = _("task log entry")
        verbose_name_plural = _("task log entries")
