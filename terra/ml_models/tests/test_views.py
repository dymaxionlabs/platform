import json

import pytest
from django.urls import reverse
from django_mock_queries.mocks import MockSet
from model_bakery import baker
from rest_framework.serializers import ModelSerializer

from ..serializers import MLModelSerializer
from ..views import MLModelViewSet
from ..models import MLModel

ml_model_fields = [
    field.name for field in MLModel._meta.get_fields()
    if (not field.name in MLModelSerializer.Meta.exclude)
]

prepare_ml_model = lambda self=None: baker.prepare(MLModel)

class TestMLModelViewset:

    ml_model_1 = prepare_ml_model()
    valid_data_dict = {
        k: v for (k, v) in ml_model_1.__dict__.items() if k in ml_model_fields
    }

    def test_list(self, mocker, rf):
        # Arrange
        qs = MockSet(
            self.ml_model_1,
            prepare_ml_model(),
            prepare_ml_model(),
        )
        url = reverse('provider-list')
        request = rf.get(url)
        view = MLModelViewSet.as_view(
            {'get': 'list'}
        )
        # Mcking
        mocker.patch.object(
            MLModelViewSet, 'get_queryset', return_value=qs
        )
        # Act
        response = view(request).render()
        # Assert
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 3

    def test_retrieve(self, mocker, rf):
        url = reverse('model-detail', kwargs={'pk': self.ml_model_1.id})
        request = rf.get(url)
        mocker.patch.object(
            MLModelViewSet, 'get_queryset', return_value=MockSet(self.ml_model_1)
        )
        view = MLModelViewSet.as_view(
            {'get': 'retrieve'}
        )

        response = view(request, pk=self.ml_model_1.id).render()

        assert response.status_code == 200

    def test_create(self, mocker, rf):
        url = reverse('model-list')
        request = rf.post(
            url,
            content_type='application/json',
            data=json.dumps(self.valid_data_dict)
        )
        save_mock = mocker.patch.object(
            MLModelSerializer, 'save'
        )
        view = MLModelViewSet.as_view(
            {'post': 'create'}
        )

        response = view(request).render()

        assert response.status_code == 201
        save_mock.assert_called()

    def test_update(self, mocker, rf):
        url = reverse('model-detail', kwargs={'pk': self.ml_model_1.id})
        request = rf.put(
            url,
            content_type='application/json',
            data=json.dumps(self.valid_data_dict)
        )
        mocker.patch.object(
            MLModelViewSet, 'get_object', return_value=self.ml_model_1
        )
        save_mock = mocker.patch.object(
            MLModelSerializer, 'save'
        )
        view = MLModelViewSet.as_view(
            {'put': 'update'}
        )

        response = view(request, pk=self.ml_model_1.id).render()

        assert response.status_code == 200
        save_mock.assert_called()

    @pytest.mark.parametrize('field', ml_model_fields)
    def test_partial_update(self, mocker, rf, field):
        field_value = self.ml_model_1.__dict__[field]
        valid_field = str(field_value) if field == "phone" else field_value
        url = reverse('model-detail', kwargs={'pk': self.ml_model_1.id})
        request = rf.patch(
            url,
            content_type='application/json',
            data=json.dumps({field: valid_field})
        )
        mocker.patch.object(
            MLModelViewSet, 'get_object', return_value=self.ml_model_1
        )
        save_mock = mocker.patch.object(
            MLModel, 'save'
        )
        view = MLModelViewSet.as_view(
            {'patch': 'partial_update'}
        )

        response = view(request).render()

        assert response.status_code == 200
        save_mock.assert_called()

    def test_delete(self, mocker, rf):
        url = reverse('provider-detail', kwargs={'pk': self.ml_model_1.id})
        request = rf.delete(url)
        mocker.patch.object(
            MLModelViewSet, 'get_object', return_value=self.ml_model_1
        )
        del_mock = mocker.patch.object(
            MLModel, 'delete'
        )
        view = MLModelViewSet.as_view(
            {'delete': 'destroy'}
        )

        response = view(request).render()

        assert response.status_code == 204
        del_mock.assert_called()