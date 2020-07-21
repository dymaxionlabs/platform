from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

from terra.tests import create_some_user, loginWithAPI
from projects.tests import create_some_project
from storage.client import Client

from .models import Estimator, File
from .views import AnnotationUpload


class EstimatorViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owner=self.user)

    def test_create_ok(self):
        response = self.client.post('/estimators/', {
            'name': "My estimator",
            'project': self.project.uuid,
            'classes': ['a', 'b']
        },
                                    format='json')

        self.assertEquals(201, response.status_code)
        self.assertEquals(
            sorted([
                'project',
                'image_files',
                'uuid',
                'estimator_type',
                'name',
                'classes',
                'metadata',
                'configuration',
                'created_at',
                'updated_at',
            ]), sorted(response.data.keys()))

    def test_duplicate_error(self):
        Estimator.objects.create(name='Foo',
                                 project=self.project,
                                 classes=['a', 'b'])

        response = self.client.post('/estimators/', {
            'name': 'Foo',
            'project': self.project.uuid,
            'classes': ['a', 'b', 'c']
        },
                                    format='json')

        self.assertEquals(400, response.status_code)
        self.assertEquals(
            {
                'non_field_errors': [
                    'The fields project, estimator_type, name must make a unique set.'
                ]
            }, response.data)

    def test_classes_required(self):
        response = self.client.post('/estimators/', {
            'name': 'Foo',
            'project': self.project.uuid,
        },
                                    format='json')

        self.assertEquals(400, response.status_code)
        self.assertEquals({'classes': ['This field is required.']},
                          response.data)

        response = self.client.post('/estimators/', {
            'name': 'Foo',
            'project': self.project.uuid,
            'classes': []
        },
                                    format='json')

        self.assertEquals(400, response.status_code)
        self.assertEquals({'classes': ['This field is required.']},
                          response.data)


class Object(object):
    pass


def mock_list_vector_files(client, arg):
    if arg == 'f1':
        return ['f1']
    else:
        return []

class EstimatorAnnotationUploadTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owners=[self.user])

    @patch("estimators.views.Client.list_files")
    @patch("estimators.views.Annotation.import_from_vector_file")
    def test_post_ok(self, mock_import_from_vector_file, mock_list_files):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        request = Object()
        setattr(
            request, 'data',
            dict(project=self.project.uuid,
                 related_file='f1',
                 vector_file='f1',
                 label='label1'))
        mock_import_from_vector_file.return_value = ['label1']
        mock_list_files.return_value = ('f1', )
        rv = AnnotationUpload().post(request, estimator.uuid)
        self.assertEquals(rv.status_code, 200)
        self.assertIn('annotation_created', rv.data['detail'].keys())
        self.assertEquals(rv.data['detail']['annotation_created'], 1)
        mock_import_from_vector_file.assert_called_once()
        mock_list_files.assert_called()

    @patch("estimators.views.Client.list_files")
    @patch("estimators.views.Annotation.import_from_vector_file")
    def test_post_file_not_found(self, mock_import_from_vector_file,
                                 mock_list_files):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        request = Object()
        setattr(
            request, 'data',
            dict(project=self.project.uuid,
                 related_file='f1',
                 vector_file='f1',
                 label='label1'))
        mock_import_from_vector_file.return_value = ['label1']
        mock_list_files.return_value = []
        rv = AnnotationUpload().post(request, estimator.uuid)
        self.assertEquals(rv.status_code, 404)
        self.assertIn('related_file', rv.data.keys())
        self.assertEquals(rv.data['related_file'], "Not found")
        mock_import_from_vector_file.assert_not_called()
        mock_list_files.assert_called_once()

    @patch("estimators.views.Client.list_files", new=mock_list_vector_files)
    @patch("estimators.views.Annotation.import_from_vector_file")
    def test_post_vector_not_found(self, mock_import_from_vector_file):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        request = Object()
        setattr(
            request, 'data',
            dict(project=self.project.uuid,
                 related_file='f1',
                 vector_file='v1',
                 label='label1'))
        mock_import_from_vector_file.return_value = ['label1']
        rv = AnnotationUpload().post(request, estimator.uuid)
        self.assertEquals(rv.status_code, 404)
        self.assertIn('vector_file', rv.data.keys())
        self.assertEquals(rv.data['vector_file'], "Not found")
        mock_import_from_vector_file.assert_not_called()

