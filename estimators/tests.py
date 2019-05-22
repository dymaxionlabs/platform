from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from terra.tests import create_some_user, loginWithAPI
from projects.tests import create_some_project

from .models import Estimator


class EstimatorTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name="Some project",
                                           owners=[self.user])

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
