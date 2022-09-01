from ml_models.models import MLModelVersion
from ml_models.tasks import predict
from model_bakery import baker
from tasks.models import Task
from tests.unit_tests.utils import undecorated_func

baker.generators.add("mdeditor.fields.MDTextField", lambda: "description")

class TestPredict:
    test_ml_model_version = baker.prepare(MLModelVersion, id=1)
    test_task = baker.prepare(Task, kwargs={"ml_model_version_id": test_ml_model_version.id})

    def test_no_errors(self, mocker):
        # Mock
        get_version_mock_return = self.test_ml_model_version
        get_version_mock = mocker.patch(
            "ml_models.tasks.MLModelVersion.objects.get",
            return_value=get_version_mock_return,
        )
        login_mock_return = "test_token"
        login_mock = mocker.patch(
            "ml_models.tasks.login",
            return_value=login_mock_return,
        )
        get_machine_name_mock_return = "test_machine_name"
        get_machine_name_mock = mocker.patch(
            "ml_models.tasks.create_instance_gpu",
            return_value=get_machine_name_mock_return,
        )
        run_predict_notebook_mock = mocker.patch(
            "ml_models.tasks.run_predict_notebook",
        )
        destroy_instance_mock = mocker.patch(
            "ml_models.tasks.destroy_instance",
        )

        # Act
        undecorated_func(predict)(self.test_task)

        # Assert
        get_version_mock.assert_called_with(pk=self.test_ml_model_version.id)
        login_mock.assert_called_once()
        get_machine_name_mock.assert_called_with(token=login_mock_return)
        run_predict_notebook_mock.assert_called_with(
            model_version=get_version_mock_return,
            task=self.test_task,
            token=login_mock_return,
        )
        destroy_instance_mock.assert_called_with(
            machine_name=get_machine_name_mock_return,
            token=login_mock_return,
        )
