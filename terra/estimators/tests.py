import io
from django.contrib.auth.models import User
from django.test import TestCase
from django.db.models import Q

from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

from terra.tests import create_some_user, loginWithAPI
from projects.tests import create_some_project, create_some_api_key, login_with_api_key
from storage.client import GCSClient

from .models import Estimator
from .views import AnnotationUpload, StartTrainingJobView, StartPredictionJobView, StartImageTilingJobView
from tasks.models import Task


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
                'training_tasks',
                'prediction_tasks',
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


def mock_list_vector_files(client, arg):
    if arg == 'f1':
        return ['f1']
    else:
        return []


class AnnotationUploadTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owner=self.user)
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)

        self.storage_client = GCSClient(self.project)

        self.file_data = io.BytesIO(b"this is a test\n")
        self.file_path = "file1.txt"
        self.client.post(
            f'/storage/upload/',
            dict(path=self.file_path, file=self.file_data),
            format='multipart',
        )

        self.vector_data = io.BytesIO(b"this is another test\n")
        self.vector_path = "vectorfile1.txt"
        self.client.post(
            f'/storage/upload/',
            dict(path=self.vector_path, file=self.vector_data),
            format='multipart',
        )

        self.file1 = list(self.storage_client.list_files(self.file_path))[0]
        self.vectorfile1 = list(self.storage_client.list_files(self.vector_path))[0]


    def tearDown(self):
        response = self.client.get(f'/storage/files/')
        for file in response.data:
            response = self.client.delete(
                '/storage/file/?path={path}'.format(path=file['path']))

    @patch("estimators.views.Annotation.import_from_vector_file")
    def test_post_ok(self, mock_import_from_vector_file):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        mock_import_from_vector_file.return_value = ['label1']

        rv = self.client.post(
            '/estimators/{}/load_labels/'.format(estimator.uuid),
            dict(project=self.project.uuid,
                 related_file=self.file_path,
                 vector_file=self.vector_path,
                 label='label1'))
        self.assertEquals(rv.status_code, 200)
        self.assertIn('annotation_created', rv.data['detail'].keys())
        self.assertEquals(rv.data['detail']['annotation_created'], 1)
        mock_import_from_vector_file.assert_called_once_with(
            self.project,
            self.vectorfile1,
            self.file1,
            estimator=estimator,
            label='label1')

    @patch("estimators.views.GCSClient.list_files")
    @patch("estimators.views.Annotation.import_from_vector_file")
    def test_post_file_not_found(self, mock_import_from_vector_file,
                                 mock_list_files):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        mock_import_from_vector_file.return_value = ['label1']
        mock_list_files.return_value = []
        rv = self.client.post(
            '/estimators/{}/load_labels/'.format(estimator.uuid),
            dict(project=self.project.uuid,
                 related_file='f1',
                 vector_file='f1',
                 label='label1'))
        self.assertEquals(rv.status_code, 404)
        self.assertIn('related_file', rv.data.keys())
        self.assertEquals(rv.data['related_file'], "Not found")
        mock_import_from_vector_file.assert_not_called()
        mock_list_files.assert_called_once()

    @patch("estimators.views.GCSClient.list_files", new=mock_list_vector_files)
    @patch("estimators.views.Annotation.import_from_vector_file")
    def test_post_vector_not_found(self, mock_import_from_vector_file):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        mock_import_from_vector_file.return_value = ['label1']
        rv = self.client.post(
            '/estimators/{}/load_labels/'.format(estimator.uuid),
            dict(project=self.project.uuid,
                 related_file=self.file_path,
                 vector_file='v1',
                 label='label1'))
        self.assertEquals(rv.status_code, 404)
        self.assertIn('vector_file', rv.data.keys())
        self.assertEquals(rv.data['vector_file'], "Not found")
        mock_import_from_vector_file.assert_not_called()


class StartTrainingJobViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owner=self.user)
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)

    def test_post_ok(self):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        rv = self.client.post(
            '/estimators/{}/train/'.format(estimator.uuid),
            dict(project=self.project.uuid,
                 related_file='f1',
                 vector_file='f1',
                 label='label1'))
        job = Task.objects.filter(Q(state='STARTED'),
                                  project=self.project,
                                  kwargs__estimator=str(estimator.uuid),
                                  name=Estimator.TRAINING_JOB_TASK).first()
        self.assertIsNotNone(job)
        self.assertEquals(rv.status_code, 200)

    def test_post_not_found(self):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        uuid = estimator.uuid
        estimator.delete()
        with self.assertRaises(Estimator.DoesNotExist):
            rv = self.client.post(
                '/estimators/{}/train/'.format(uuid),
                dict(project=self.project.uuid,
                     related_file='f1',
                     vector_file='f1',
                     label='label1'))


class StartPredictionJobViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owner=self.user)

    @patch("estimators.views.Task.start")
    def test_post_ok(self, mock_start):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        request = dict(user=self.user, files=['f1', 'f2'], output_path='foo/')

        # to test prediction I need a training job
        rv = self.client.post('/estimators/{}/train/'.format(estimator.uuid),
                              request)
        mock_start.assert_called_once()
        self.assertEquals(rv.status_code, 200)

        # I finish the job
        job = Task.objects.filter(kwargs__estimator=str(estimator.uuid),
                                  name=Estimator.TRAINING_JOB_TASK).last()
        job.state = "FINISHED"
        job.save()

        rv = self.client.post('/estimators/{}/predict/'.format(estimator.uuid),
                              request)
        self.assertEquals(rv.status_code, 200)
        job = Task.objects.filter(Q(state='STARTED') | Q(state='PENDING'),
                                  kwargs__estimator=str(estimator.uuid),
                                  name=Estimator.PREDICTION_JOB_TASK).first()
        self.assertIsNotNone(job)

    @patch("estimators.views.Task.start")
    def test_post_bad_request(self, mock_start):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        request = dict(files=['f1', 'f2'], output_path='foo/')

        rv = self.client.post('/estimators/{}/predict/'.format(estimator.uuid),
                              request)
        self.assertEquals(rv.status_code, 400)

    def test_post_not_found(self):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        uuid = estimator.uuid
        estimator.delete()
        with self.assertRaises(Estimator.DoesNotExist):
            rv = self.client.post('/estimators/{}/train/'.format(uuid),
                                  dict(project=self.project.uuid))


class StartImageTilingJobViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owner=self.user)
        _, self.api_key = create_some_api_key(user=self.user,
                                              project=self.project)
        login_with_api_key(self.client, self.api_key)

    def test_post_ok(self):
        estimator = Estimator.objects.create(name='Foo',
                                             project=self.project,
                                             classes=['a', 'b'])
        rv = self.client.post('/estimators/start_tiling_job/', {
            'path': 'path/',
            'output_path': 'out/',
            'tile_size': 'foo'
        },
                              format='json')
        self.assertEqual(rv.status_code, 200)
        job = Task.objects.filter(Q(state='STARTED') | Q(state='PENDING'),
                                  project=self.project,
                                  kwargs__path='path/',
                                  name=Estimator.IMAGE_TILING_TASK).first()
        self.assertIsNotNone(job)

    def test_post_path_not_found(self):
        request = dict(output_path='out/', tile_size='foo')
        rv = self.client.post('/estimators/start_tiling_job/', request)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.data['path'], 'Not found')

    def test_post_output_path_not_found(self):
        request = dict(path='path/', tile_size='foo')
        rv = self.client.post('/estimators/start_tiling_job/', request)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.data['output_path'], 'Not found')
