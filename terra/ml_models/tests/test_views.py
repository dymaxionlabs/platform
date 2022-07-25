import json

import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from django_mock_queries.mocks import MockSet
from model_bakery import baker
from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import AnonymousUser

from ..serializers import MLModelSerializer
from ..views import MLModelViewSet
from ..models import MLModel


prepare_ml_model = lambda self=None: baker.prepare(MLModel)
ml_model_1 = prepare_ml_model()
test_user = baker.prepare(get_user_model())


class TestAllMLModelViewset:
    def test_list(self, mocker, rf):

        # Arrange
        qs = MockSet(
            ml_model_1,
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
        k: v for (k, v) in ml_model_1.__dict__.items() if k in MLModel._meta.get_fields()
    }

    def test_list(self, mocker, rf):

        # Arrange
        qs = MockSet(
            ml_model_1,
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
        endpoint_kwargs = {"user_username": test_user.get_username(), "name": ml_model_1.name}
        url = reverse(
            "models-detail",
            kwargs=endpoint_kwargs,
        )
        request = rf.get(url)
        view = MLModelViewSet.as_view({"get": "retrieve"})

        # Mock
        mocker.patch.object(
            MLModelViewSet, "get_queryset", return_value=MockSet(ml_model_1)
        )
        mocker.patch.object(
            MLModelViewSet, "get_queryset", return_value=MockSet(ml_model_1)
        )

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        assert response.status_code == 200

