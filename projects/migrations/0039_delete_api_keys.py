from django.db import migrations
from django.conf import settings


def delete_all_api_keys(apps, schema_editor):
    UserAPIKey = apps.get_model('projects', 'userapikey')
    UserAPIKey.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0038_rename_in_beta_remove_free_20200330_1258'),
    ]

    operations = [
        migrations.RunPython(delete_all_api_keys),
    ]
