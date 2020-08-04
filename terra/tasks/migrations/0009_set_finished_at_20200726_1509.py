# Generated by Django 3.0.5 on 2020-07-26 15:09

from django.db import migrations


def set_finished_at(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    for task in Task.objects.filter(finished_at=None, state__in=['FINISHED', 'CANCELED', 'FAILED']):
        task.finished_at = task.updated_at
        task.save(update_fields=['finished_at'])


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0008_auto_20200725_0344'),
    ]

    operations = [
        migrations.RunPython(set_finished_at, migrations.RunPython.noop),
    ]