from unittest import skip

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.gis.geos import Polygon
from terra.tests import create_some_user, loginWithAPI

from .models import Project, ProjectInvitationToken, UserAPIKey, Layer, Map


def create_some_project(*, owner, collaborators=[], **data):
    if not collaborators:
        collaborators = [owner]
    project = Project.objects.create(**data, owner=owner)
    project.collaborators.set(collaborators)
    return project


def create_some_layer(*, project, **data):
    return Layer.objects.create(**data, project=project)


def create_some_map(*, project, **data):
    return Map.objects.create(**data, project=project)


def create_some_api_key(name="Default", *, user, project):
    return UserAPIKey.objects.create_key(name=name, user=user, project=project)


def login_with_api_key(client, api_key):
    client.credentials(HTTP_AUTHORIZATION=f"Api-Key {api_key}")


class LoginViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username="test")
        self.test_user.set_password("secret")
        self.test_user.save()
        self.client = APIClient()

    def test_login_ok(self):
        response = self.client.post(
            "/v1/auth/login/", {"username": "test", "password": "secret"}, format="json"
        )
        self.assertEquals(200, response.status_code)
        self.assertTrue("key" in response.data)

    def test_login_fail(self):
        response = self.client.post(
            "/v1/auth/login/",
            {"username": "test", "password": "bad_password"},
            format="json",
        )
        self.assertEquals(400, response.status_code)
        self.assertEquals(
            ["Unable to log in with provided credentials."],
            response.data["non_field_errors"],
        )


class LogoutViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username="test")
        self.test_user.set_password("secret")
        self.test_user.save()
        self.client = APIClient()

    def test_logout_ok(self):
        loginWithAPI(self.client, username="test", password="secret")
        response = self.client.post("/v1/auth/logout/", {}, format="json")
        self.assertEqual(200, response.status_code)
        self.assertEqual({"detail": "Successfully logged out."}, response.data)

    def test_logout_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION="foobar")
        response = self.client.post("/v1/auth/logout/", format="json")
        self.assertEqual(401, response.status_code)
        self.assertEquals("Invalid token.", response.data["detail"])


class TestAuthViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username="test")
        self.test_user.set_password("secret")
        self.test_user.save()
        self.client = APIClient()

    def test_auth_ok(self):
        loginWithAPI(self.client, "test", "secret")
        response = self.client.get("/v1/test/auth", {}, format="json")
        self.assertEqual(200, response.status_code)

    def test_auth_fail(self):
        response = self.client.get("/v1/test/auth", {}, format="json")
        self.assertEqual(401, response.status_code)


class ContactViewTest(TestCase):
    @skip("Mailchimp subscription now disabled")
    def test_create_ok(self):
        response = self.client.post(
            "/v1/contact/",
            {"email": "john@doe.com", "message": "This is a test message"},
            format="json",
        )
        self.assertEquals(200, response.status_code)
        self.assertEquals("User subscribed", response.data["detail"])


class ConfirmProjectInvitationViewTest(TestCase):
    def setUp(self):
        self.test_user = User(email="test@prueba.com", username="test")
        self.test_user.set_password("secret")
        self.test_user.save()
        self.client = APIClient()

    def test_create_public_token(self):
        # Create a project
        project = Project.objects.create(name="testproject", owner=self.test_user)

        # Create a project invitation token (without email)
        invite_token = ProjectInvitationToken.objects.create(project=project)

        self.assertFalse(self.test_user.has_perm("view_project", project))

        loginWithAPI(self.client, "test", "secret")

        url = "/v1/projects/invitations/{key}/confirm/".format(key=invite_token.key)
        response = self.client.post(url, {}, format="json")

        self.assertEquals(200, response.status_code)
        self.assertTrue(self.test_user.has_perm("view_project", project))

    def test_create_public_token_new_user(self):
        # Create a project
        project = Project.objects.create(name="testproject", owner=self.test_user)

        # Create a project invitation token (without email)
        invite_token = ProjectInvitationToken.objects.create(project=project)

        # Register a new user with API
        response = self.client.post(
            "/v1/auth/registration/",
            dict(
                username="test2",
                email="test@example.com",
                password1="secret0345",
                password2="secret0345",
            ),
            format="json",
        )
        self.assertEquals(201, response.status_code)
        user_token = response.data["key"]

        # Get user and check permissions
        user = User.objects.get(username="test2")
        self.assertFalse(user.has_perm("view_project", project))

        # Confirm invitation of user to project
        url = "/v1/projects/invitations/{key}/confirm/".format(key=invite_token.key)
        self.client.credentials(HTTP_AUTHORIZATION=user_token)
        response = self.client.post(url, {}, format="json")
        self.assertEquals(200, response.status_code)

        # Check permissions again
        self.assertTrue(user.has_perm("view_project", project))


class UserAPIKeyViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, "secret")
        self.project = create_some_project(name="Some project", owner=self.user)

    def test_create_user_api_key(self):
        params = {"name": "default", "project": self.project.uuid}
        response = self.client.post("/v1/api_keys/", params, format="json")

        self.assertEquals(200, response.status_code)
        for field in ["key", "prefix", "created"]:
            self.assertTrue(field in response.data)
        self.assertEqual(response.data["user"], self.user.username)
        self.assertEqual(response.data["project"], self.project.uuid)
        self.assertEqual(response.data["name"], "default")

    def test_create_user_api_key_with_invalid_project(self):
        invalid_uuid = "e1a6e48c-7e72-476c-954e-f0df1cd5cb8f"

        params = {"name": "default", "project": invalid_uuid}
        response = self.client.post("/v1/api_keys/", params, format="json")

        self.assertEquals(400, response.status_code)
        self.assertEquals(dict(project="Project not found"), response.data)

    def test_list_all_user_api_keys(self):
        # Create some API keys
        api_keys = [self.create_some_api_key(name=n)[0] for n in ["first", "second"]]

        response = self.client.get("/v1/api_keys/", format="json")
        self.assertEquals(200, response.status_code)
        expected_api_keys = [
            dict(
                prefix=k.prefix,
                name=k.name,
                user=k.user.username,
                project=k.project.uuid,
            )
            for k in api_keys
        ]
        response_api_keys = [
            dict(
                prefix=k["prefix"], name=k["name"], user=k["user"], project=k["project"]
            )
            for k in response.data
        ]
        key_fn = lambda d: d["prefix"]
        self.assertEqual(
            sorted(expected_api_keys, key=key_fn), sorted(response_api_keys, key=key_fn)
        )

    def test_list_user_api_keys_from_project(self):
        # Create an API key on first project
        self.create_some_api_key(name="first")

        # Create a second project with an API key
        second_project = create_some_project(name="Second project", owner=self.user)
        second_project_api_key, _ = self.create_some_api_key(
            name="second", project=second_project
        )

        # Get all API keys from second project
        response = self.client.get(
            "/v1/api_keys/", dict(project=second_project.uuid), format="json"
        )
        self.assertEquals(200, response.status_code)
        self.assertEquals(1, len(response.data))
        self.assertEquals(response.data[0]["prefix"], second_project_api_key.prefix)

    def test_list_no_user_api_keys_from_other_user(self):
        # Create an API key of another user and project
        another_user = create_some_user(username="ana")
        create_some_project(name="Another project", owner=another_user)
        self.create_some_api_key(name="first", user=another_user)

        response = self.client.get(
            "/v1/api_keys/", dict(project=self.project.uuid), format="json"
        )
        self.assertEquals(200, response.status_code)
        self.assertEquals(0, len(response.data))

    def test_revoke_user_api_key(self):
        api_key, _ = self.create_some_api_key(name="first")
        self.assertEqual(UserAPIKey.objects.get_usable_keys().count(), 1)

        response = self.client.patch(
            "/v1/api_keys/{prefix}".format(prefix=api_key.prefix),
            dict(revoked=True),
            format="json",
        )
        self.assertEquals(200, response.status_code)
        self.assertEqual(UserAPIKey.objects.get_usable_keys().count(), 0)

    def create_some_api_key(self, **kwargs):
        new_kwargs = dict(user=self.user, project=self.project)
        new_kwargs.update(**kwargs)
        return create_some_api_key(**new_kwargs)


class LayerViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, "secret")
        self.project = create_some_project(name="Some project", owner=self.user)
        self.layer = create_some_layer(name="Some layer", project=self.project)

    def test_list_layers(self):
        response = self.client.get(
            "/v1/layers/", dict(project=self.project.uuid), format="json"
        )
        self.assertEquals(200, response.status_code)
        self.assertEquals(1, len(response.data["results"]))

    def test_retrieve_layer(self):
        response = self.client.get(f"/v1/layers/{self.layer.uuid}/", format="json")
        self.assertEquals(200, response.status_code)
        self.assertEquals(response.data["uuid"], str(self.layer.uuid))
        self.assertEquals(response.data["name"], self.layer.name)


class MapViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, "secret")
        self.project = create_some_project(name="Some project", owner=self.user)
        self.map = create_some_map(name="Some map", project=self.project)

    def test_list_maps(self):
        response = self.client.get(
            "/v1/maps/", dict(project=self.project.uuid), format="json"
        )
        self.assertEquals(200, response.status_code)
        self.assertEquals(1, len(response.data["results"]))

    def test_retrieve_map(self):
        response = self.client.get(f"/v1/maps/{self.map.uuid}/", format="json")
        self.assertEquals(200, response.status_code)
        self.assertEquals(response.data["uuid"], str(self.map.uuid))
        self.assertEquals(response.data["name"], self.map.name)


class ProjectViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_some_user()
        loginWithAPI(self.client, self.user.username, "secret")

    def test_list(self):
        create_some_project(name="Project A", owner=self.user)
        create_some_project(name="Project B", owner=self.user)

        response = self.client.get("/v1/projects/", format="json")
        self.assertEquals(200, response.status_code)
        self.assertEquals(
            3, len(response.data["results"])
        )  # there are 3 and not 2, because of the default project

    def test_create(self):
        response = self.client.post(
            f"/v1/projects/",
            dict(name="My new project", collaborators=[self.user.username]),
            format="json",
        )
        self.assertEquals(201, response.status_code)
        self.assertEquals(response.data["name"], "My new project")
        self.assertEquals(response.data["collaborators"], [self.user.username])
