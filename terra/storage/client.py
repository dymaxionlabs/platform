import logging
import os
from fnmatch import fnmatch

from django.conf import settings
from google.cloud import storage as gcs

logger = logging.getLogger(__name__)


class GCSClient:
    def __init__(self, project):
        self.project = project
        self._client = None
        self._bucket = None

    def list_files(self, glob_path="*"):
        clean_path = glob_path.lstrip(" /").rstrip()
        prefix = clean_path.split("*")[0]
        full_prefix = os.path.join(self._prefix, prefix)
        logger.info("List blobs on {}".format(full_prefix))
        blobs = self.client.list_blobs(settings.FILES_BUCKET,
                                       prefix=full_prefix,
                                       versions=False)
        files = (GCSFile(blob) for blob in blobs)
        return (f for f in files if fnmatch(f.path, clean_path))

    def upload_from_filename(self, filename, to='', content_type=None):
        full_path = self._get_path(to, filename=filename)
        logger.info("Create blob on {}".format(full_path))
        blob = self.bucket.blob(full_path)
        logger.info("Upload from filename {} with content type {}".format(
            filename, content_type))
        blob.upload_from_filename(filename=filename, content_type=content_type)
        return GCSFile(blob)

    def upload_from_file(self,
                         file_obj,
                         to,
                         rewind=False,
                         size=None,
                         content_type=None):
        full_path = self._get_path(to)
        logger.info("Create blob on {}".format(full_path))
        blob = self.bucket.blob(full_path)
        logger.info(
            "Upload from file with: rewind={rewind}, size={size}, content_type={content_type}"
            .format(rewind=rewind, size=size, content_type=content_type))
        blob.upload_from_file(file_obj,
                              rewind=rewind,
                              size=size,
                              content_type=content_type)
        return GCSFile(blob)

    def create_resumable_upload_session(self,
                                        to,
                                        size=None,
                                        content_type=None):
        full_path = self._get_path(to)
        logger.info("Create blob on {}".format(full_path))
        blob = self.bucket.blob(full_path)
        url = blob.create_resumable_upload_session(content_type=content_type,
                                                   size=size)
        return url

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
        if os.path.basename(res) == '':
            if not filename:
                raise ValueError("{} is a directory")
            name = os.path.basename(filename)
            res = os.path.join(res, name)
        return res


class GCSFile:
    def __init__(self, blob):
        self.blob = blob
        self.deleted = False

    def __eq__(self, other):
        if isinstance(other, GCSFile):
            return self.path == other.path
        return False

    def download_to_filename(self, filename, start=None, end=None):
        self.blob.download_to_filename(filename, start=start, end=end)

    def download_to_file(self, file_obj, start=None, end=None):
        self.blob.download_to_file(file_obj, start=start, end=end)

    def delete(self):
        self.blob.delete()
        self.deleted = True

    @property
    def path(self):
        return "/".join(self.blob.name.split("/")[1:])

    @property
    def name(self):
        return os.path.basename(self.path)

    @property
    def metadata(self):
        return self.blob.metadata or {}

    def __repr__(self):
        return "<GCSFile path={path}{deleted}>".format(
            path=self.path, deleted=" deleted" if self.deleted else "")


def upload_directory(rootdir, *, client):
    for root, _subdirs, files in os.walk(rootdir):
        for file in files:
            path = os.path.join(root, file)
            client.upload_from_filename(path, to='{}/'.format(root))
