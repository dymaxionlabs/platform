import django_rq
from django.db.models.signals import post_save
from django.dispatch import receiver

from projects.models import File


@receiver(post_save, sender=File)
def generate_image_tiles_from_file(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('estimators.tasks.generate_image_tiles', instance.pk)
