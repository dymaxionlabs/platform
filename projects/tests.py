from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient


class LoginViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_login_ok(self):
        response = self.client.post(
            '/rest-auth/login/', {
                'username': 'test',
                'password': 'secret'
            },
            format='json')
        self.assertEquals(200, response.status_code)
        self.assertTrue('key' in response.data)

    def test_login_fail(self):
        response = self.client.post(
            '/rest-auth/login/', {
                'username': 'test',
                'password': 'bad_password'
            },
            format='json')
        self.assertEquals(400, response.status_code)
        self.assertEquals(["Unable to log in with provided credentials."],
                          response.data['non_field_errors'])


def loginWithAPI(client, username, password):
    response = client.post('/rest-auth/login/',
                           dict(username=username, password=password))
    if response.status_code != 200 or 'key' not in response.data:
        raise RuntimeError('Login failed in test. Status code {}'.format(
            response.status_code))
    return response.data['key']


class LogoutViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_logout_ok(self):
        token = loginWithAPI(self.client, username='test', password='secret')
        self.client.credentials(HTTP_AUTHORIZATION=('Token %s' % token))
        response = self.client.post('/rest-auth/logout/', {}, format='json')
        self.assertEqual(200, response.status_code)
        self.assertEqual({'detail': 'Successfully logged out.'}, response.data)

    def test_logout_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=('Token foobar'))
        response = self.client.post('/rest-auth/logout/', format='json')
        self.assertEqual(403, response.status_code)
        self.assertEquals("Invalid token.", response.data['detail'])


class ExampleViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()

    def test_session_auth_ok(self):
        loginWithAPI(self.client, 'test', 'secret')
        response = self.client.get('/example/', {}, format='json')
        self.assertEqual(204, response.status_code)

    def test_token_auth_ok(self):
        # Login to get token, and delete session
        token = loginWithAPI(self.client, 'test', 'secret')
        self.client.session.delete()

        # Try to GET only with the token
        self.client.credentials(HTTP_AUTHORIZATION=('Token %s' % token))
        response = self.client.get('/example/', {}, format='json')
        self.assertEqual(204, response.status_code)

    def test_auth_fail(self):
        response = self.client.get('/example/', {}, format='json')
        self.assertEqual(403, response.status_code)
