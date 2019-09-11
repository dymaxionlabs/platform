import django_rq
import os
from django.db.models.signals import post_save
from django.dispatch import receiver

from projects.models import File
from .models import TrainingJob, PredictionJob


@receiver(post_save, sender=File)
def generate_image_tiles_from_file(sender, instance, created, **kwargs):
    ext = os.path.splitext(instance.name)[1]
    if created:
        if ext in ['.jpg','.tif','.jpeg','.png']:
            django_rq.enqueue('estimators.tasks.generate_image_tiles', instance.pk)


@receiver(post_save, sender=TrainingJob)
def start_training_job(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('estimators.tasks.start_training_job', instance.pk)


@receiver(post_save, sender=PredictionJob)
def start_prediction_job(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('estimators.tasks.start_prediction_job', instance.pk)
