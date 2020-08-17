import os
import tempfile

import django_rq
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from quotas.models import UserQuota
from tasks.models import Task
from tasks.signals import task_finished
from terra.emails import TrainingCompletedEmail, PredictionCompletedEmail

from .models import Estimator


@receiver(pre_save, sender=Estimator)
def pre_save_handler(sender, instance, *args, **kwargs):
    quota = UserQuota.objects.get(user=instance.project.owner)
    created_estimators = Estimator.objects.filter(
        project=instance.project).count()
    if created_estimators >= quota.max_estimator_per_project:
        raise Exception(
            'Quota exceeded - You can only create {} estimators per project'.
            format(quota.max_estimator_per_project))


@receiver(task_finished, sender=Task)
def send_job_completed_email(sender, task, **kwargs):
    # TODO: These should be rq jobs...
    if task.name == Estimator.TRAINING_JOB_TASK:
        send_training_job_completed_email(task)
    elif task.name == Estimator.PREDICTION_JOB_TASK:
        send_prediction_job_completed_email(task)


def send_training_job_completed_email(task):
    estimator = Estimator.objects.get(uuid=task.kwargs["estimator"])
    users = estimator.project.collaborators.all()
    users = [
        user for user in users if user.userprofile.send_notification_emails
    ]
    email = TrainingCompletedEmail(estimator=estimator,
                                   recipients=[user.email for user in users])
    email.send_mail()


def send_prediction_job_completed_email(task):
    estimator = Estimator.objects.get(uuid=task.kwargs["estimator"])
    users = estimator.project.collaborators.all()
    users = [
        user for user in users if user.userprofile.send_notification_emails
    ]
    email = PredictionCompletedEmail(estimator=estimator,
                                     recipients=[user.email for user in users])
    email.send_mail()
