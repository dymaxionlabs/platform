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


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def migrate_to_storage(file):
    client = Client(file.project)
    try:
        with tempfile.NamedTemporaryFile() as tmpfile:
            shutil.copyfileobj(file.file, tmpfile)
            src = tmpfile.name
            run_subprocess('{sdk_bin_path}/gsutil -m cp -r {src} {dst}'.format(
                sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
                src=src,
                dst='gs://{bucket}/project_{project_id}/{filename}'.format(
                    bucket=settings.ESTIMATORS_BUCKET,
                    project_id='X',
                    filename=file.file.name)))
        return True

    except Exception as e:
        print(e)
        return False


def migration():
    files = File.objects.all()
    count = files.count()
    c = 0
    for file in files:
        print("Migrando {} de {}...".format(c, count))
        result = migrate_to_storage(file)
        if result:
            print("Migracion {} exitosa".format(c))
        else:
            print("Migracion {} fallida".format(c))
        c = c + 1


if __name__ == '__main__':
    migration()
