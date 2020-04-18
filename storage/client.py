import os

from django.conf import settings
from google.cloud import storage as gcs


class Client:
    def __init__(self, project):
        self.project = project
        self._client = None
        self._bucket = None

    def list_files(self, *args, **kwargs):
        blobs = self.client.list_blobs(settings.FILES_BUCKET,
                                       *args,
                                       prefix=self._prefix,
                                       versions=False,
                                       **kwargs)
        return (File(blob) for blob in blobs)

    def upload_from_filename(self, filename, to=''):
        """
        Upload a file
        """
        full_path = os.path.join(self._prefix, to.lstrip(" /"))
        if os.path.basename(full_path) == '':
            name = os.path.basename(filename)
            full_path = os.path.join(full_path, name)
        print(full_path)
        blob = self.bucket.blob(full_path)
        blob.upload_from_filename(filename=filename)
        return File(blob)

    @property
    def client(self):
        if not self._client:
            self._client = gcs.Client()
        return self._client

    @property
    def bucket(self):
        if not self._bucket:
            self._bucket = self.client.get_bucket(settings.FILES_BUCKET)
        return self._bucket

    @property
    def _prefix(self):
        if not self.project.id:
            raise ValueError("Project has no id")
        return "project_{}/".format(self.project.id)


class File:
    def __init__(self, blob):
        self.blob = blob
        self.deleted = False

    def download_to_filename(self, filename, start=None, end=None):
        self.blob.download_to_filename(filename, start=start, end=end)

    def download_to_file(self, file_obj, start=None, end=None):
        self.blob.download_to_file(file_obj, start=start, end=end)

    def delete(self):
        self.blob.delete()
        self.deleted = True

    def __repr__(self):
        return "<File {name}{deleted}>".format(
            name=self.name, deleted=" deleted" if self.deleted else "")

    @property
    def name(self):
        return "/".join(self.blob.name.split("/")[1:])