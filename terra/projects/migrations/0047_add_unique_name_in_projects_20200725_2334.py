# Generated by Django 3.0.5 on 2020-07-25 23:34

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0046_rename_duplicate_projects_20200725_2327'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='project',
            unique_together={('owner', 'name')},
        ),
    ]
