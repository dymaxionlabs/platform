from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from quotations.models import Quotation


def loginWithAPI(client, username, password):
    response = client.post('/auth/login/',
                           dict(username=username, password=password))
    if response.status_code != 200 or 'key' not in response.data:
        raise RuntimeError('Login failed in test. Status code {}'.format(
            response.status_code))
    return response.data['key']


class QuotationViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_ok(self):
        response = self.client.post(
            '/quotations/', {
                'name': 'John',
                'email': 'john@doe.com',
                'message': 'This is a test message',
            },
            format='json')

        self.assertEquals(201, response.status_code)
        self.assertEquals(
            sorted([
                'url', 'name', 'email', 'message', 'areas_geom', 'layers',
                'extra_fields', 'created_at', 'updated_at', 'user'
            ]), sorted(response.data.keys()))
        self.assertEquals('John', response.data['name'])
        self.assertEquals('john@doe.com', response.data['email'])
        self.assertEquals('This is a test message', response.data['message'])

    def test_retrieve_ok_if_admin(self):
        quotation = self.create_some_quotation()
        admin_user = self.create_some_admin_user(password='secret')

        loginWithAPI(self.client, admin_user.username, 'secret')

        response = self.client.get('/quotations/{}/'.format(quotation.id))
        self.assertEquals(200, response.status_code)
        self.assertQuotationDetail(quotation, response.data)

    def test_retrieve_ok_if_owner(self):
        user = self.create_some_user()
        quotation = self.create_some_quotation(user=user)

        loginWithAPI(self.client, user.username, 'secret')

        response = self.client.get('/quotations/{}/'.format(quotation.id))
        self.assertEquals(200, response.status_code)
        self.assertQuotationDetail(quotation, response.data)

    def test_retrieve_fail_if_not_owner_nor_admin(self):
        # User 1 creates a quotation
        user = self.create_some_user()
        quotation = self.create_some_quotation(user=user)

        # User 2 authenticates
        user2 = self.create_some_user(username='jane')
        loginWithAPI(self.client, user2.username, 'secret')

        # User 2 tries to get quotation from User 1, but fails
        response = self.client.get('/quotations/{}/'.format(quotation.id))
        self.assertEquals(401, response.status_code)

    def create_some_quotation(self, user=None):
        quotation = Quotation.objects.create(
            name='John', email='john@doe.com', user=user)
        quotation.save()
        return quotation

    def create_some_user(self, username='john', password='secret'):
        user = User(email="john@doe.com", username=username)
        user.set_password(password)
        user.save()
        return user

    def create_some_admin_user(self, password='secret'):
        user = User(email="admin@example.com", username='admin', is_staff=True)
        user.set_password(password)
        user.save()
        return user

    def assertQuotationDetail(self, quotation, response_data):
        self.assertEquals(
            sorted([
                'url', 'name', 'email', 'message', 'areas_geom', 'layers',
                'extra_fields', 'created_at', 'updated_at', 'user'
            ]), sorted(response_data.keys()))
        self.assertEquals(quotation.name, response_data['name'])
        self.assertEquals(quotation.email, response_data['email'])
        self.assertEquals(quotation.message, response_data['message'])