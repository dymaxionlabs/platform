#!/usr/bin/env python3
import django
import json
import io
import os
import time
import subprocess
import mimetypes
import tempfile
import shutil
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()

from django.conf import settings
from projects.models import File
from storage.client import Client


def migrate_to_storage(file):
    client = Client(file.project)
    try:
        with tempfile.NamedTemporaryFile() as tmpfile:
            shutil.copyfileobj(file.file, tmpfile)
            src = tmpfile.name
            client.upload_from_filename(
                src,
                to=file.name,
                content_type=mimetypes.MimeTypes().guess_type(
                    file.file.name)[0])
        file.migrated = True
        file.save()
        return True

    except Exception as e:
        print(e)
        return False


def reset_migration():
    for file in File.objects.all():
        file.migrated = False
        file.save()


def migration():
    unmigrated_files = File.objects.filter(migrated=False)
    count = unmigrated_files.count()
    c = 0
    for file in unmigrated_files:
        print("Migrando {} de {}...".format(c, count))
        result = migrate_to_storage(file)
        if result:
            print("Migracion {} exitosa".format(c))
        else:
            print("Migracion {} fallida".format(c))
        c = c + 1


if __name__ == '__main__':
    migration()
