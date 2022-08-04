import json

from django.contrib.auth import get_user_model
from django.urls import reverse
from django_mock_queries.mocks import MockSet
from ml_models.models import MLModel, MLModelVersion
from ml_models.utils.constants import PREDICT_TASK
from ml_models.views import MLModelVersionViewSet, MLModelViewSet
from model_bakery import baker
from projects.models import Project
from rest_framework.response import Response
from tasks.models import Task

prepare_ml_model = lambda: baker.prepare(MLModel)
test_model = prepare_ml_model()
test_user = baker.prepare(get_user_model())


class TestAllMLModelViewset:
    def test_list(self, mocker, rf, _mock_views_permissions):

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
    def test_list(self, mocker, rf, _mock_views_permissions):

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

    def test_retrieve(self, mocker, rf, _mock_views_permissions):

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
        mocker.patch.object(MLModelViewSet, "get_queryset", return_value=MockSet(test_model))
        mocker.patch.object(MLModelViewSet, "get_queryset", return_value=MockSet(test_model))

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        assert response.status_code == 200


class TestMLModelVersionViewSet:

    prepare_model_version = lambda self=None: baker.prepare(MLModelVersion)
    test_model_version = prepare_model_version()

    def test_list(self, mocker, rf, _mock_views_permissions):

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

    def test_retrieve(self, mocker, rf, _mock_views_permissions):

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
        version_filter_mock = mocker.patch(
            "ml_models.views.MLModelVersion.objects.filter",
            return_value=MockSet(),
        )
        mocker.patch(
            "ml_models.views.get_object_or_404",
            return_value=self.test_model_version,
        )
        serializer_mock_return_value = mocker.Mock()
        serializer_mock_return_value_data = {}
        serializer_mock_return_value.data = serializer_mock_return_value_data
        serializer_mock = mocker.patch(
            "ml_models.views.MLModelVersionSerializer",
            return_value=serializer_mock_return_value,
        )
        response_mock = mocker.patch(
            "ml_models.views.Response",
            return_value=Response(serializer_mock_return_value_data),
        )

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        version_filter_mock.assert_called_with(
            **{
                "model__owner__username": test_user.get_username(),
                "model__name": test_model.name,
                "name": self.test_model_version.name,
            }
        )
        serializer_mock.assert_called_with(self.test_model_version)
        response_mock.assert_called_with(serializer_mock_return_value_data)
        assert response.status_code == 200

    def test_predict(self, mocker, rf, _mock_views_permissions):

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
        test_project = baker.prepare(Project, id=1)
        request.project = test_project
        view = MLModelVersionViewSet.as_view({"get": "predict"})

        # Mock
        version_filter_mock = mocker.patch(
            "ml_models.views.MLModelVersion.objects.filter",
            return_value=MockSet(),
        )
        mocker.patch(
            "ml_models.views.get_object_or_404",
            return_value=self.test_model_version,
        )
        test_task = baker.prepare(Task)
        enqueue_task_mock = mocker.patch("ml_models.views.enqueue_task", return_value=test_task)
        serializer_mock_return_value = mocker.Mock()
        serializer_mock_return_value_data = {}
        serializer_mock_return_value.data = serializer_mock_return_value_data
        serializer_mock = mocker.patch(
            "ml_models.views.TaskSerializer",
            return_value=serializer_mock_return_value,
        )
        response_mock = mocker.patch(
            "ml_models.views.Response",
            return_value=Response(serializer_mock_return_value_data),
        )

        # Act
        response = view(request, **endpoint_kwargs).render()

        # Assert
        version_filter_mock.assert_called_with(
            **{
                "model__owner__username": test_user.get_username(),
                "model__name": test_model.name,
                "name": self.test_model_version.name,
            }
        )
        enqueue_task_mock.assert_called_with(
            PREDICT_TASK,
            **{
                "ml_model_version_id": self.test_model_version.id,
                "project_id": test_project.id,
                "user_params": {},
            }
        )
        serializer_mock.assert_called_with(test_task)
        response_mock.assert_called_with(serializer_mock_return_value_data)
        assert response.status_code == 200
