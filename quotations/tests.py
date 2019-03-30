from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Request


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


class RequestViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_ok(self):
        response = self.client.post(
            '/requests/', {
                'name': 'John',
                'email': 'john@doe.com',
                'message': 'This is a test message',
                'areas': [],
            },
            format='json')

        self.assertEquals(201, response.status_code)
        self.assertEquals(
            sorted([
                'id', 'name', 'email', 'message', 'areas', 'layers',
                'last_state_update', 'extra_fields', 'created_at',
                'updated_at', 'user'
            ]), sorted(response.data.keys()))
        self.assertEquals('John', response.data['name'])
        self.assertEquals('john@doe.com', response.data['email'])
        self.assertEquals('This is a test message', response.data['message'])

    def test_retrieve_ok_if_admin(self):
        request = self.create_some_request()
        admin_user = self.create_some_admin_user(password='secret')

        loginWithAPI(self.client, admin_user.username, 'secret')

        response = self.client.get('/requests/{}/'.format(request.id))
        self.assertEquals(200, response.status_code)
        self.assertRequestDetail(request, response.data)

    def test_retrieve_ok_if_owner(self):
        user = self.create_some_user()
        request = self.create_some_request(user=user)

        loginWithAPI(self.client, user.username, 'secret')

        response = self.client.get('/requests/{}/'.format(request.id))
        self.assertEquals(200, response.status_code)
        self.assertRequestDetail(request, response.data)

    def test_retrieve_fail_if_not_owner_nor_admin(self):
        # User 1 creates a request
        user = self.create_some_user()
        request = self.create_some_request(user=user)

        # User 2 authenticates
        user2 = self.create_some_user(username='jane')
        loginWithAPI(self.client, user2.username, 'secret')

        # User 2 tries to get request from User 1, but fails
        response = self.client.get('/requests/{}/'.format(request.id))
        self.assertEquals(404, response.status_code)

    def test_list_all_if_admin(self):
        # User 1 creates a request
        user = self.create_some_user()
        request = self.create_some_request(user=user)

        # User 2 creates a request
        user2 = self.create_some_user(username='jane')
        request2 = self.create_some_request(user=user2)

        # An admin user authenticates
        admin_user = self.create_some_admin_user(password='secret')
        loginWithAPI(self.client, admin_user.username, 'secret')

        response = self.client.get('/requests/')
        self.assertEquals(200, response.status_code)
        data = response.data
        self.assertEquals(2, data['count'])
        self.assertRequestDetail(request, data['results'][0])
        self.assertRequestDetail(request2, data['results'][1])

    def test_list_none_if_not_authenticated(self):
        # Some user creates a request
        user = self.create_some_user()
        request = self.create_some_request(user=user)

        response = self.client.get('/requests/')
        self.assertEquals(200, response.status_code)
        data = response.data
        self.assertEquals(0, data['count'])
        self.assertEquals([], data['results'])

    def test_list_requests_from_user(self):
        # User 1 creates a request
        user = self.create_some_user()
        request = self.create_some_request(user=user)

        # User 2 creates a request
        user2 = self.create_some_user(username='jane')
        request2 = self.create_some_request(user=user2)

        loginWithAPI(self.client, user2.username, 'secret')

        response = self.client.get('/requests/')
        self.assertEquals(200, response.status_code)
        data = response.data
        self.assertEquals(1, data['count'])
        self.assertRequestDetail(request2, data['results'][0])

    def create_some_request(self, user=None):
        request = Request.objects.create(
            name='John', email='john@doe.com', user=user)
        request.save()
        return request

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

    def assertRequestDetail(self, request, response_data):
        self.assertEquals(
            sorted([
                'id', 'name', 'email', 'message', 'areas', 'layers',
                'last_state_update', 'extra_fields', 'created_at',
                'updated_at', 'user'
            ]), sorted(response_data.keys()))
        self.assertEquals(request.name, response_data['name'])
        self.assertEquals(request.email, response_data['email'])
        self.assertEquals(request.message, response_data['message'])
