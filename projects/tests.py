from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from projects.models import Project, ProjectInvitationToken


def loginWithAPI(client, username, password):
    response = client.post('/auth/login/',
                           dict(username=username, password=password))
    if response.status_code != 200 or 'key' not in response.data:
        raise RuntimeError('Login failed in test. Status code {}'.format(
            response.status_code))
    token = response.data['key']
    # Set Authorization header with Token
    client.credentials(HTTP_AUTHORIZATION=token)
    return token


class LoginViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_login_ok(self):
        response = self.client.post(
            '/auth/login/', {
                'username': 'test',
                'password': 'secret'
            },
            format='json')
        self.assertEquals(200, response.status_code)
        self.assertTrue('key' in response.data)

    def test_login_fail(self):
        response = self.client.post(
            '/auth/login/', {
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


class UserViewSetTest(APITestCase):
    def setUp(self):
        self.user = User(email='user@test.com', username='user')
        self.user.set_password('secret')
        self.user.save()

        self.admin_user = User(
            email='admin@test.com', username='admin', is_staff=True)
        self.admin_user.set_password('secret')
        self.admin_user.save()

    def test_user_list_only_shows_logged_in_user(self):
        loginWithAPI(self.client, 'user', 'secret')

        url = reverse('user-list')
        response = self.client.get(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([{
            'username': 'user',
            'email': 'user@test.com',
            'first_name': '',
            'last_name': ''
        }], response.data['results'])

    def test_user_list_shows_all_if_admin(self):
        loginWithAPI(self.client, 'admin', 'secret')

        url = reverse('user-list')
        response = self.client.get(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expectedUsers = [
            {
                'username': 'AnonymousUser',
                'email': '',
                'first_name': '',
                'last_name': '',
            },
            {
                'username': 'user',
                'email': 'user@test.com',
                'first_name': '',
                'last_name': '',
            },
            {
                'username': 'admin',
                'email': 'admin@test.com',
                'first_name': '',
                'last_name': '',
            },
        ]
        self.assertEqual(expectedUsers, response.data['results'])

    def test_user_create_fail(self):
        pass

    def test_user_update_fail(self):
        pass

    def test_user_delete_fail(self):
        pass


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
        response = self.client.post(
            '/contact/', {
                'email': 'john@doe.com',
                'message': 'This is a test message',
            },
            format='json')

        self.assertEquals(200, response.status_code)
        self.assertEquals('Contact message has been sent',
                          response.data['detail'])


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
        response = self.client.post(
            '/auth/registration/',
            dict(
                username='test2',
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
