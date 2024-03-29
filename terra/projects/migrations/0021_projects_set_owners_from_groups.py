# Generated by Django 2.1.7 on 2019-03-09 16:27

from django.db import migrations
from django.conf import settings


def set_owners_from_groups(apps, schema_editor):
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))
    Project = apps.get_model('projects', 'project')

    for project in Project.objects.all():
        project.owners.add(*User.objects.filter(groups__in=project.groups.all()))


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0020_project_owners'),
    ]

    operations = [
        migrations.RunPython(set_owners_from_groups),
    ]
