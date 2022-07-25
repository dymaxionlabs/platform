import json

import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from django_mock_queries.mocks import MockSet
from model_bakery import baker
from rest_framework.serializers import ModelSerializer

from ..serializers import MLModelSerializer
from ..views import MLModelViewSet
from ..models import MLModel
from .fixtures import mock_authentication

ml_model_fields = [
    field.name for field in MLModel._meta.get_fields()
]

prepare_ml_model = lambda self=None: baker.prepare(MLModel)
test_user = baker.prepare(get_user_model())

class TestAllMLModelViewset:
    ml_model_1 = prepare_ml_model()
    valid_data_dict = {
        k: v for (k, v) in ml_model_1.__dict__.items() if k in ml_model_fields
    }
    
    def test_list(self, mocker, rf, mock_authentication):
        
        # Arrange
        qs = MockSet(
            self.ml_model_1,
            prepare_ml_model(),
            prepare_ml_model(),
        )
        url = reverse('mlmodel-list', kwargs=None)
        request = rf.get(url)
        view = MLModelViewSet.as_view(
            {'get': 'list'}
        )

        # Mock
        mocker.patch.object(
            MLModelViewSet, 'get_queryset', return_value=qs
        )

        # Act
        response = view(request).render()

        # Assert
        assert response.status_code == 200
        assert json.loads(response.content)["count"] == 3

    