from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient


class LoginViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username='test')
        self.test_user.set_password('secret')
        self.test_user.save()
        self.client = APIClient()
        self.client.login(username='test', password='secret')

    def test_login_ok(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'test',
            'password': 'secret'
        })
        self.assertEquals(200, response.status_code)
        self.assertEquals({
            'username': 'test',
            'email': 'test@prueba.com'
        }, response.data['user'])
        self.assertTrue('token' in response.data)

    def test_login_fail(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'test',
            'password': 'bad_password'
        })
        self.assertEquals(400, response.status_code)
        self.assertEquals(["Unable to log in with provided credentials."],
                          response.data['non_field_errors'])
