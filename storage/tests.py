import io
import os

from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from projects.models import Project
from projects.tests import create_some_api_key, login_with_api_key
from storage.client import Client
from terra.tests import create_some_user


class ClientListFilesTest(TestCase):
    def test_list_file(self):
        with open("/tmp/testfile1.txt", "w") as f:
            f.write("this is a test\n")
        with open("/tmp/testfile2.py", "w") as f:
            f.write("# this is another test\n")

        self.cl = Client(Project.objects.first())
        self.cl.upload_from_filename("/tmp/testfile1.txt")
        self.cl.upload_from_filename("/tmp/testfile2.py", "foo/")

        uploaded_files = []
        for f in self.cl.list_files("*testfile*"):
            uploaded_files.append(f.path)

        check_files = ["testfile1.txt", "foo/testfile2.py"]

        for f in check_files:
            self.assertIn(f, uploaded_files)


class UploadFileTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        self.project = Project.objects.filter(owners=self.user).first()
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)

    def test_upload_file(self):
        f = io.BytesIO(b"some initial binary data: \x00\x01")
        path = "foo/data.bin"

        response = self.client.post(f'/storage/upload/{path}', dict(file=f))
        self.assertEquals(200, response.status_code)
        self.assertTrue('detail' in response.data)
        self.assertEqual(
            response.data['detail'],
            dict(name=os.path.basename(path), path=path, metadata={}))
