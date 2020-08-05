# Generated by Django 3.0.5 on 2020-08-05 14:29

from django.db import migrations


def fix_args_kwargs_internal_metadata(apps, schema_editor):
    internal_attrs = ['uses_cloudml']

    Task = apps.get_model('tasks', 'Task')
    for task in Task.objects.all():
        old_internal_metadata = task.internal_metadata or {}
        kwargs = {
            k: v
            for k, v in old_internal_metadata.items()
            if k not in internal_attrs
        }
        internal_metadata = {
            k: v
            for k, v in old_internal_metadata.items()
            if k not in kwargs.keys()
        }
        task.args = []
        task.kwargs = kwargs
        task.internal_metadata = internal_metadata
        task.save(update_fields=['args', 'kwargs', 'internal_metadata'])


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0012_alter_json_args_kwargs'),
    ]

    operations = [
        migrations.RunPython(fix_args_kwargs_internal_metadata,
                             migrations.RunPython.noop),
    ]
