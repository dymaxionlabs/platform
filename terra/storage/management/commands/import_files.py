from django.core.management.base import BaseCommand

from projects.models import Project
from storage.client import GCSClient
from storage.models import File


class Command(BaseCommand):
    help = 'Creates Files for each blob in user storage (deprecated)'

    def handle(self, *args, **options):
        for project in Project.objects.all():
            self.stdout.write(f"Loading files from {project}")
            client = GCSClient(project)
            files = client.list_files()
            for file in files:
                File.objects.get_or_create(project=project,
                                           path=file.path,
                                           defaults={
                                               'size': file.blob.size,
                                               'metadata': file.metadata
                                           })
