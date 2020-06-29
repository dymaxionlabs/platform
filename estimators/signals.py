import django_rq
import os
from django.db.models.signals import post_save
from django.dispatch import receiver

from projects.models import File
from .models import TrainingJob, PredictionJob


@receiver(post_save, sender=TrainingJob)
def start_training_job(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('estimators.tasks.start_training_job', instance.pk)
