# Generated by Django 3.0.5 on 2020-07-23 18:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0042_remove_layer_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='send_notification_emails',
            field=models.BooleanField(default=True),
        ),
    ]
