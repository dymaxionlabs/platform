import logging
import os

from django.conf import settings
from google.cloud import storage as gcs

_logger = logging.getLogger(__name__)


class Client:
    def __init__(self, project):
        self.project = project
        self._client = None
        self._bucket = None

    def list_files(self, **kwargs):
        _logger.debug("List blobs on {}".format(self._prefix))
        blobs = self.client.list_blobs(settings.FILES_BUCKET,
                                       prefix=self._prefix,
                                       versions=False,
                                       **kwargs)
        return (File(blob) for blob in blobs)

    def upload_from_filename(self, filename, to='', content_type=None):
        full_path = self._get_path(to)
        _logger.debug("Create blob on {}".format(full_path))
        blob = self.bucket.blob(full_path)
        _logger.debug("Upload from filename {} with content type {}".format(
            filename, content_type))
        blob.upload_from_filename(filename=filename, content_type=content_type)
        return File(blob)

    def upload_from_file(self,
                         file_obj,
                         to,
                         rewind=False,
                         size=None,
                         content_type=None):
        full_path = self._get_path(to)
        _logger.debug("Create blob on {}".format(full_path))
        blob = self.bucket.blob(full_path)
        _logger.debug(
            "Upload from file with: rewind={rewind}, size={size}, content_type={content_type}"
            .format(rewind=rewind, size=size, content_type=content_type))
        blob.upload_from_file(file_obj,
                              rewind=rewind,
                              size=size,
                              content_type=content_type)
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

    def _get_path(self, to, filename=None):
        res = os.path.join(self._prefix, to.lstrip(" /"))
        if filename and os.path.basename(res) == '':
            name = os.path.basename(filename)
            res = os.path.join(res, name)
        return res


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
