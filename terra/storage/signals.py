from django.db.models.signals import post_delete
from django.dispatch import receiver
from .client import Client
from .models import File


@receiver(post_delete, sender=File)
def delete_file_in_bucket(sender, instance, **kwargs):
    client = Client(instance.project)
    files = list(client.list_files(instance.path))
    if files:
        files[0].delete()
