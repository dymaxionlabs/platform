# Generated by Django 3.0.5 on 2020-08-11 18:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0017_auto_20200805_2338'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='traceback',
        ),
        migrations.AddField(
            model_name='task',
            name='error',
            field=models.TextField(blank=True, null=True, verbose_name='error'),
        ),
    ]
