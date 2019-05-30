import django_rq
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from terra.emails import WelcomeEmail

from .models import File, UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if created and instance.email:
        email = WelcomeEmail(user=instance,
                             recipients=[instance.email],
                             language_code='es')
        email.send_mail()


@receiver(post_save, sender=File)
def generate_raster_tiles_from_file(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('projects.tasks.generate_raster_tiles', instance.pk)
