# Generated by Django 3.0.5 on 2020-07-24 14:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0043_userprofile_send_notification_emails'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='owners',
            new_name='collaborators',
        ),
    ]