from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status

from .payments import MP_CLIENT, MercadoPagoClient


def loginWithAPI(client, username, password):
    response = client.post('/v1/auth/login/',
                           dict(username=username, password=password))
    if response.status_code != status.HTTP_200_OK or 'key' not in response.data:
        raise RuntimeError('Login failed in test. Status code {}'.format(
            response.status_code))
    token = response.data['key']
    # Set Authorization header with Token
    client.credentials(HTTP_AUTHORIZATION=token)
    return token


def create_some_user(username='john', password='secret'):
    user = User(email="john@doe.com", username=username)
    user.set_password(password)
    user.save()
    return user


def create_some_admin_user(password='secret'):
    user = User(email="admin@example.com", username='admin', is_staff=True)
    user.set_password(password)
    user.save()
    return user


class MercadoPagoClientTest(TestCase):
    def setUp(self):
        self.mp = MP_CLIENT

    def test_available_countries(self):
        pass
        # FIXME
        #self.assertEqual(['AR'], self.mp.available_countries)
