# Generated by Django 2.2.7 on 2020-03-30 12:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0037_lowercase_usernames'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='free',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='in_beta',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='beta',
            field=models.BooleanField(default=False),
        ),
    ]
