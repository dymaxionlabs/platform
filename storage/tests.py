import io
import os
from urllib.parse import parse_qs, urlparse

import requests
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

        response = self.client.post(f'/storage/upload/',
                                    dict(path=path, file=f),
                                    format='multipart')
        self.assertEquals(200, response.status_code)
        self.assertTrue('detail' in response.data)
        self.assertEqual(
            response.data['detail'],
            dict(name=os.path.basename(path), path=path, metadata={}))

    def test_path_missing(self):
        f = io.BytesIO(b"some initial binary data: \x00\x01")
        response = self.client.post(f'/storage/upload/',
                                    dict(file=f),
                                    format='multipart')
        self.assertEquals(400, response.status_code)
        self.assertEqual(response.data['detail'], "'path' missing")


class FileViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        self.project = Project.objects.filter(owners=self.user).first()
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)
        self.storage_client = Client(self.project)
        self.test_data = io.BytesIO(b"test file content")
        self.test_path = "foo/data.bin"

    def test_retrieve_file(self):
        self.storage_client.upload_from_file(self.test_data, to=self.test_path)
        response = self.client.get(f'/storage/file/?path={self.test_path}')
        self.assertEquals(200, response.status_code)
        self.assertTrue('detail' in response.data)
        self.assertEqual(
            response.data['detail'],
            dict(name=os.path.basename(self.test_path),
                 path=self.test_path,
                 metadata={}))
        files = list(self.storage_client.list_files(self.test_path))
        if not files:
            raise FileNotFoundError
        files[0].delete()

    def test_file_missing(self):
        missing_path = self.test_path + '.1'
        response = self.client.get(f'/storage/file/?path={missing_path}')
        self.assertEquals(404, response.status_code)

    def test_path_missing(self):
        response = self.client.get(f'/storage/file/')
        self.assertEquals(400, response.status_code)
        self.assertEqual(response.data['detail'], "'path' missing")

    def test_destroy_file(self):
        self.storage_client.upload_from_file(self.test_data, to=self.test_path)
        response = self.client.delete(f'/storage/file/?path={self.test_path}')
        self.assertEquals(200, response.status_code)
        self.assertTrue('detail' in response.data)
        self.assertEqual(response.data['detail'], 'File deleted.')
        files = list(self.storage_client.list_files(self.test_path))
        self.assertFalse(files, 'File was not deleted.')

    def test_destroy_file_missing(self):
        missing_path = self.test_path + '.1'
        response = self.client.delete(f'/storage/file/?path={missing_path}')
        self.assertEquals(404, response.status_code)

    def test_destroy_path_missing(self):
        response = self.client.delete(f'/storage/file/')
        self.assertEquals(400, response.status_code)
        self.assertEqual(response.data['detail'], "'path' missing")


class DownloadFileTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        self.project = Project.objects.filter(owners=self.user).first()
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)

        self.storage_client = Client(self.project)
        self.test_data = io.BytesIO(b"test file content")
        self.test_path = "foo/data.bin"
        self.storage_client.upload_from_file(self.test_data, to=self.test_path)

    def test_download_file(self):
        response = self.client.get(f'/storage/download/?path={self.test_path}')
        self.assertEquals(200, response.status_code)
        self.test_data.seek(0)
        self.assertEqual(response.data, self.test_data.read())

    def test_download_path_missing(self):
        response = self.client.get(f'/storage/download/')
        self.assertEquals(400, response.status_code)
        self.assertEqual(response.data['detail'], "'path' missing")

    def test_download_file_missing(self):
        missing_path = self.test_path + '.1'
        response = self.client.get(f'/storage/download/?path={missing_path}')
        self.assertEquals(404, response.status_code)

    def tearDown(self):
        files = list(self.storage_client.list_files(self.test_path))
        if not files:
            raise FileNotFoundError
        files[0].delete()


class CreateResumableUploadTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        self.project = Project.objects.filter(owners=self.user).first()
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)

    def test_create_resumable_upload(self):
        path = "foo/data.bin"
        bin_data = b"12345678901234567890"

        response = self.client.post(
            f'/storage/create-resumable-upload/?path={path}&size={len(bin_data)}'
        )

        self.assertEquals(200, response.status_code)
        self.assertTrue('session_url' in response.data)
        url = response.data['session_url']

        parsed_url = urlparse(url)
        self.assertEquals(parsed_url.netloc, 'storage.googleapis.com')
        self.assertTrue('upload_id' in parsed_url.query)

    def test_path_missing(self):
        response = self.client.post('/storage/create-resumable-upload/')
        self.assertEquals(400, response.status_code)
        self.assertEqual(response.data['detail'], "'path' missing")
