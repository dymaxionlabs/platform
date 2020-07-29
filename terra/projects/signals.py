import django_rq
import os
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from terra.emails import WelcomeEmail
from terra.utils import slack_notify

from .models import File, UserProfile, Project
from quotas.models import UserQuota


@receiver(post_save, sender=User)
def configure_user_and_default_project(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        UserQuota.objects.create(user=instance)
        project = Project.objects.create(name='Default', owner=instance)
        project.collaborators.set([instance])


@receiver(post_save, sender=User)
def notify_user_signup(sender, instance, created, **kwargs):
    if created:
        slack_notify(f'New user signed up! {instance.username}, {instance.email}')


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if created and instance.email:
        email = WelcomeEmail(user=instance,
                             recipients=[instance.email])
        email.send_mail()


# Disabled for now
#@receiver(post_save, sender=File)
def generate_raster_tiles_from_file(sender, instance, created, **kwargs):
    ext = os.path.splitext(instance.name)[1]
    if created:
        if ext in ['.jpg', '.tif', '.jpeg', '.png']:
            django_rq.enqueue('projects.tasks.generate_raster_tiles',
                              instance.pk)
        if ext in ['.json', '.geojson']:
            django_rq.enqueue('projects.tasks.generate_vector_tiles',
                              instance.pk)


@receiver(pre_save, sender=Project)
def pre_save_handler(sender, instance, *args, **kwargs):
    quota = UserQuota.objects.get(user=instance.owner)
    created_estimators = Project.objects.filter(owner=instance.owner).count()
    if created_estimators >= quota.max_projects_per_user:
        raise Exception('Quota exceeded')
