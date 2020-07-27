#!/usr/bin/env python3
import django
import os
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()

from django.conf import settings
from projects.models import Project
from storage.client import Client
from storage.models import File

def load():
    for project in Project.objects.all():
        print("Loading files from {}".format(project))
        client = Client(project)
        files = client.list_files()
        for file in files:
            File.objects.get_or_create(
                project=project,
                path=file.path,
                defaults={
                    'size': file.blob.size,
                    'metadata': file.metadata
                }
            )


if __name__ == '__main__':
    load()
