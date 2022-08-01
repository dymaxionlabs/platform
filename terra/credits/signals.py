from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from tasks.models import Task
from tasks.signals import task_finished

from .models import LogEntry


@receiver(post_save, sender=User)
def add_initial_credit(sender, instance, created, **kwargs):
    if created:
        LogEntry.objects.create(user=instance,
                                kind='credit',
                                description='Initial credit',
                                value=10000)
