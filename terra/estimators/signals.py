import django_rq
import os
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from projects.models import File
from .models import TrainingJob, PredictionJob, Estimator


@receiver(post_save, sender=TrainingJob)
def start_training_job(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('estimators.tasks.start_training_job', instance.pk)

@receiver(pre_save, sender=Estimator)
def pre_save_handler(sender, instance, *args, **kwargs):
    quota = UserQuota.objects.get(user=instance.project.owner)
    created_estimators = Estimator.objects.filter(project=instance.project).count()
    if created_estimators >= quota.max_estimator_per_project
        raise Exception('Quota exceeded')