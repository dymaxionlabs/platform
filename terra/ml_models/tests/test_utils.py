import json
from ml_models.utils.logic import login
from django.conf import settings


class TestLogin:
    
    def test_login(self, mocker):
        post_mock_return = mocker.Mock()
        token_value = "test_token"
        post_mock_return.json = lambda: {"access_token": token_value}
        post_mock = mocker.patch(
            "ml_models.utils.logic.requests.post",
            return_value=post_mock_return,
        )

        login_token = login()

        post_mock.assert_called_with(
            f"{settings.LF_SERVER_URL}/v1/auth/login",
            **{
                "data": json.dumps(
                    {
                        "username": settings.LF_USERNAME,
                        "password": settings.LF_PASSWORD,
                    }
                )
            },
        )
        assert login_token == token_value


class TestCreateInstanceGPU:
    def test_create_instance_gpu(self, mocker):
        assert False


class TestRunPredictNotebook:
    def test_run_predict_notebook(self, mocker):
        assert False


class TestDestroyInstance:
    def test_destroy_instance(self, mocker):
        assert False


class TestWaitForTask:
    def test_task_executed(self, mocker):
        assert False

    def test_task_error(self, mocker):
        assert False
