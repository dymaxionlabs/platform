import json

import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from django_mock_queries.mocks import MockSet
from model_bakery import baker
from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import AnonymousUser

from projects.models import Project
from tasks.models import Task

from ..serializers import MLModelSerializer
from ..views import MLModelVersionViewSet, MLModelViewSet
from ..models import MLModel, MLModelVersion


prepare_ml_model = lambda: baker.prepare(MLModel)
test_model = prepare_ml_model()
test_user = baker.prepare(get_user_model())


class TestAllMLModelViewset:
    def test_list(self, mocker, rf):

        # Arrange
        qs = MockSet(
            test_model,
            prepare_ml_model(),
            prepare_ml_model(),
        )
        url = reverse("mlmodel-list", kwargs=None)
        request = rf.get(url)
        view = MLModelViewSet.as_view({"get": "list"})

        # Mock
        mocker.patch.object(MLModelViewSet, "get_queryset", return_value=qs)

        # Act
        response = view(request).render()

        # Assert
        assert response.status_code == 200
        assert json.loads(response.content)["count"] == 3


class TestMLModelViewset:

    valid_data_dict = {
        k: v
        for (k, v) in test_model.__dict__.items()
        if k in MLModel._meta.get_fields()
    }

    def test_list(self, mocker, rf):

        # Arrange
        qs = MockSet(
            test_model,
            prepare_ml_model(),
            prepare_ml_model(),
        )
        url = reverse("models-list", kwargs={"user_username": test_user.get_username()})
        request = rf.get(url)
        view = MLModelViewSet.as_view({"get": "list"})

        # Mock
        mocker.patch.object(MLModelViewSet, "get_queryset", return_value=qs)

        # Act
        response = view(request).render()

        # Assert
        assert response.status_code == 200
        assert json.loads(response.content)["count"] == 3

    def test_retrieve(self, mocker, rf):

        # Arrange
        endpoint_kwargs = {
            "user_username": test_user.get_username(),
            "name": test_model.name,
        }
        url = reverse(
            "models-detail",
            kwargs=endpoint_kwargs,
        )
        request = rf.get(url)
        view = MLModelViewSet.as_view({"get": "retrieve"})

        # Mock
        mocker.patch.object(
            MLModelViewSet, "get_queryset", return_value=MockSet(test_model)
        )
        mocker.patch.object(
            MLModelViewSet, "get_queryset", return_value=MockSet(test_model)
        )

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        assert response.status_code == 200


class TestMLModelVersionViewSet:

    prepare_model_version = lambda self=None: baker.prepare(MLModelVersion)
    test_model_version = prepare_model_version()

    def test_list(self, mocker, rf):

        # Arrange
        qs = MockSet(
            self.test_model_version,
            self.prepare_model_version(),
            self.prepare_model_version(),
        )
        endpoint_kwargs = {
            "user_username": test_user.get_username(),
            "model_name": test_model.name,
        }
        url = reverse("versions-list", kwargs=endpoint_kwargs)
        request = rf.get(url)
        view = MLModelVersionViewSet.as_view({"get": "list"})

        # Mock
        mocker.patch.object(MLModelVersionViewSet, "get_queryset", return_value=qs)

        # Act
        response = view(request).render()

        # Assert
        assert response.status_code == 200
        assert json.loads(response.content)["count"] == 3

    def test_retrieve(self, mocker, rf):

        # Arrange
        endpoint_kwargs = {
            "user_username": test_user.get_username(),
            "model_name": test_model.name,
            "name": self.test_model_version.name,
        }
        url = reverse(
            "versions-detail",
            kwargs=endpoint_kwargs,
        )
        request = rf.get(url)
        view = MLModelVersionViewSet.as_view({"get": "retrieve"})

        # Mock
        mocker.patch(
            'ml_models.views.get_object_or_404',
            return_value=self.test_model_version,
        )

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        assert response.status_code == 200

    def test_predict(self, mocker, rf):

        # Arrange
        endpoint_kwargs = {
            "user_username": test_user.get_username(),
            "model_name": test_model.name,
            "name": self.test_model_version.name,
        }
        url = reverse(
            "versions-predict",
            kwargs=endpoint_kwargs,
        )
        request = rf.get(url)
        request.project = baker.prepare(Project, id=1)
        view = MLModelVersionViewSet.as_view({"get": "predict"})

        # Mock
        mocker.patch(
            'ml_models.views.get_object_or_404',
            return_value=self.test_model_version,
        )
        mocker.patch(
            'ml_models.views.enqueue_task',
            return_value=baker.prepare(Task)
        )
        serialized_data_mock = mocker.Mock()
        serialized_data_mock.data = {}
        mocker.patch(
            'tasks.serializers.TaskSerializer',
            return_value=serialized_data_mock
        )

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        assert response.status_code == 200