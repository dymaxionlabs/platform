from django.db import migrations
from django.conf import settings


def make_usernames_lowercase(apps, schema_editor):
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))

    for user in User.objects.exclude(username='AnonymousUser'):
        user.username = user.username.lower()
        user.save(update_fields=["username"])


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0036_userprofile_free'),
    ]

    operations = [
        migrations.RunPython(make_usernames_lowercase,
                             reverse_code=migrations.RunPython.noop),
    ]
