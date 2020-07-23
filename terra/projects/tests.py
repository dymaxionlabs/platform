from collections import OrderedDict

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from terra.tests import create_some_user, loginWithAPI

from .models import Project, ProjectInvitationToken, UserAPIKey


def create_some_project(*, owners, **data):
    project = Project.objects.create(**data)
    project.owners.set(owners)
    return project


def create_some_api_key(name='Default', *, user, project):
    return UserAPIKey.objects.create_key(name=name, user=user, project=project)


def login_with_api_key(client, api_key):
    client.credentials(HTTP_AUTHORIZATION=f'Api-Key {api_key}')


class LoginViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_login_ok(self):
        response = self.client.post('/auth/login/', {
            'username': 'test',
            'password': 'secret'
        },
                                    format='json')
        self.assertEquals(200, response.status_code)
        self.assertTrue('key' in response.data)

    def test_login_fail(self):
        response = self.client.post('/auth/login/', {
            'username': 'test',
            'password': 'bad_password'
        },
                                    format='json')
        self.assertEquals(400, response.status_code)
        self.assertEquals(["Unable to log in with provided credentials."],
                          response.data['non_field_errors'])


class LogoutViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_logout_ok(self):
        loginWithAPI(self.client, username='test', password='secret')
        response = self.client.post('/auth/logout/', {}, format='json')
        self.assertEqual(200, response.status_code)
        self.assertEqual({'detail': 'Successfully logged out.'}, response.data)

    def test_logout_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='foobar')
        response = self.client.post('/auth/logout/', format='json')
        self.assertEqual(401, response.status_code)
        self.assertEquals("Invalid token.", response.data['detail'])


class TestAuthViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_auth_ok(self):
        loginWithAPI(self.client, 'test', 'secret')
        response = self.client.get('/test/auth', {}, format='json')
        self.assertEqual(200, response.status_code)

    def test_auth_fail(self):
        response = self.client.get('/test/auth', {}, format='json')
        self.assertEqual(401, response.status_code)


class ContactViewTest(TestCase):
    def test_create_ok(self):
        response = self.client.post('/contact/', {
            'email': 'john@doe.com',
            'message': 'This is a test message',
            'landing': 'newsletter-landing'
        },
                                    format='json')

        self.assertEquals(200, response.status_code)
        self.assertEquals('User subscribed', response.data['detail'])


class ConfirmProjectInvitationViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_create_public_token(self):
        # Create a project
        project = Project.objects.create(name='testproject')

        # Create a project invitation token (without email)
        invite_token = ProjectInvitationToken.objects.create(project=project)

        self.assertFalse(self.test_user.has_perm('view_project', project))

        loginWithAPI(self.client, 'test', 'secret')

        url = '/projects/invitations/{key}/confirm/'.format(
            key=invite_token.key)
        response = self.client.post(url, {}, format='json')

        self.assertEquals(200, response.status_code)
        self.assertTrue(self.test_user.has_perm('view_project', project))

    def test_create_public_token_new_user(self):
        # Create a project
        project = Project.objects.create(name='testproject')

        # Create a project invitation token (without email)
        invite_token = ProjectInvitationToken.objects.create(project=project)

        # Register a new user with API
        response = self.client.post('/auth/registration/',
                                    dict(username='test2',
                                         email='test@example.com',
                                         password1='secret0345',
                                         password2='secret0345'),
                                    format='json')
        self.assertEquals(201, response.status_code)
        user_token = response.data['key']

        # Get user and check permissions
        user = User.objects.get(username='test2')
        self.assertFalse(user.has_perm('view_project', project))

        # Confirm invitation of user to project
        url = '/projects/invitations/{key}/confirm/'.format(
            key=invite_token.key)
        self.client.credentials(HTTP_AUTHORIZATION=user_token)
        response = self.client.post(url, {}, format='json')
        self.assertEquals(200, response.status_code)

        # Check permissions again
        self.assertTrue(user.has_perm('view_project', project))


class UserAPIKeyViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, 'secret')
        self.project = create_some_project(name='Some project',
                                           owners=[self.user])

    def test_create_user_api_key(self):
        params = {'name': 'default', 'project': self.project.uuid}
        response = self.client.post('/api_keys/', params, format='json')

        self.assertEquals(200, response.status_code)
        for field in ['key', 'prefix', 'created']:
            self.assertTrue(field in response.data)
        self.assertEqual(response.data['user'], self.user.username)
        self.assertEqual(response.data['project'], self.project.uuid)
        self.assertEqual(response.data['name'], 'default')

    def test_create_user_api_key_with_invalid_project(self):
        invalid_uuid = 'e1a6e48c-7e72-476c-954e-f0df1cd5cb8f'

        params = {'name': 'default', 'project': invalid_uuid}
        response = self.client.post('/api_keys/', params, format='json')

        self.assertEquals(400, response.status_code)
        self.assertEquals(dict(project='Project not found'), response.data)

    def test_list_all_user_api_keys(self):
        # Create some API keys
        api_keys = [
            self.create_some_api_key(name=n)[0] for n in ['first', 'second']
        ]

        response = self.client.get('/api_keys/', format='json')
        self.assertEquals(200, response.status_code)
        expected_api_keys = [
            dict(prefix=k.prefix,
                 name=k.name,
                 user=k.user.username,
                 project=k.project.uuid) for k in api_keys
        ]
        response_api_keys = [
            dict(prefix=k['prefix'],
                 name=k['name'],
                 user=k['user'],
                 project=k['project']) for k in response.data
        ]
        key_fn = lambda d: d['prefix']
        self.assertEqual(sorted(expected_api_keys, key=key_fn),
                         sorted(response_api_keys, key=key_fn))

    def test_list_user_api_keys_from_project(self):
        # Create an API key on first project
        self.create_some_api_key(name='first')

        # Create a second project with an API key
        second_project = create_some_project(name='Second project',
                                             owners=[self.user])
        second_project_api_key, _ = self.create_some_api_key(
            name='second', project=second_project)

        # Get all API keys from second project
        response = self.client.get('/api_keys/',
                                   dict(project=second_project.uuid),
                                   format='json')
        self.assertEquals(200, response.status_code)
        self.assertEquals(1, len(response.data))
        self.assertEquals(response.data[0]['prefix'],
                          second_project_api_key.prefix)

    def test_list_no_user_api_keys_from_other_user(self):
        # Create an API key of another user and project
        another_user = create_some_user(username='ana')
        create_some_project(name='Another project', owners=[another_user])
        self.create_some_api_key(name='first', user=another_user)

        response = self.client.get('/api_keys/',
                                   dict(project=self.project.uuid),
                                   format='json')
        self.assertEquals(200, response.status_code)
        self.assertEquals(0, len(response.data))

    def test_revoke_user_api_key(self):
        api_key, _ = self.create_some_api_key(name='first')
        self.assertEqual(UserAPIKey.objects.get_usable_keys().count(), 1)

        response = self.client.patch(
            '/api_keys/{prefix}'.format(prefix=api_key.prefix),
            dict(revoked=True),
            format='json')
        self.assertEquals(200, response.status_code)
        self.assertEqual(UserAPIKey.objects.get_usable_keys().count(), 0)

    def create_some_api_key(self, **kwargs):
        new_kwargs = dict(user=self.user, project=self.project)
        new_kwargs.update(**kwargs)
        return create_some_api_key(**new_kwargs)