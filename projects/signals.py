import django_rq
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import File


@receiver(post_save, sender=File)
def generate_raster_tiles_from_file(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('projects.tasks.generate_raster_tiles', instance.pk)