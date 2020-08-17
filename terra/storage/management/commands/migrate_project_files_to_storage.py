import os
import shutil
import tempfile

from django.conf import settings
from django.core.management.base import BaseCommand

from terra.utils import gsutilCopy
from projects.models import File
from storage.client import GCSClient


class Command(BaseCommand):
    help = 'Migrate project Files to user storage (deprecated)'

    def handle(self, *args, **options):
        files = File.objects.all()
        count = files.count()
        c = 0
        for file in files:
            print("Migrando {} de {}...".format(c, count))
            result = self.migrate_to_storage(file)
            if result:
                print("Migracion {} exitosa".format(c))
            else:
                print("Migracion {} fallida".format(c))
            c = c + 1

    def migrate_to_storage(self, file):
        client = GCSClient(file.project)
        try:
            with tempfile.NamedTemporaryFile() as tmpfile:
                shutil.copyfileobj(file.file, tmpfile)
                src = tmpfile.name
                gsutilCopy(
                    src,
                    'gs://{bucket}/project_{project_id}/{filename}'.format(
                        bucket=settings.FILES_BUCKET,
                        project_id=file.project.pk,
                        filename=file.name))
            return True
        except Exception as e:
            print(e)
            return False
