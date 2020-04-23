from django.test import TestCase
from storage.client import Client
from projects.models import Project


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
