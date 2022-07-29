import json
from django.conf import settings
from model_bakery import baker
import pytest

from ml_models.utils.constants import CREATE_INSTANCE_BODY
from ml_models.utils.logic import (
    create_instance_gpu,
    destroy_instance,
    login,
    run_predict_notebook,
    wait_for_task,
)
from ml_models.models import MLModel, MLModelVersion
from tasks.models import Task
from projects.models import Project


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
        post_mock_return = mocker.Mock()
        jobid_value = "test_jobid"
        post_mock_return.json = lambda: {"jobid": jobid_value}
        post_mock = mocker.patch(
            "ml_models.utils.logic.requests.post",
            return_value=post_mock_return,
        )
        token_value = "test_token"
        machine_name_value = "test_machine"
        wait_for_task_mock = mocker.patch(
            "ml_models.utils.logic.wait_for_task",
            return_value={"machine_name": machine_name_value},
        )

        machine_name = create_instance_gpu(token=token_value)

        post_mock.assert_called_with(
            f"{settings.LF_SERVER_URL}/v1/clusters",
            **{
                "data": json.dumps(CREATE_INSTANCE_BODY),
                "headers": {"Authorization": token_value},
            },
        )
        wait_for_task_mock.assert_called_with(jobid_value, **{"token": token_value})
        assert machine_name == machine_name_value


class TestRunPredictNotebook:
    def test_input_dir_available(self, mocker):
        lf_project_id = "test_lf_project_id"
        model_obj = baker.prepare(MLModel, lf_project_id=lf_project_id)
        model_version_obj = baker.prepare(MLModelVersion, model=model_obj)
        task_kwargs = {"user_params": {"input_dir": "/test_dir/"}}
        project_pk = 1
        project = baker.prepare(Project, pk=project_pk)
        task_pk = 1
        task_obj = baker.prepare(Task, kwargs=task_kwargs, project=project, pk=task_pk)
        token_value = "test_token"
        params = {
            "model_version": model_version_obj,
            "task": task_obj,
            "token": token_value,
        }
        post_mock_return = mocker.Mock()
        execid_value = "test_execid"
        post_mock_return.json = lambda: {"execid": execid_value}
        post_mock = mocker.patch(
            "ml_models.utils.logic.requests.post",
            return_value=post_mock_return,
        )
        wait_for_task_mock_return = "wait_for_task_result"
        wait_for_task_mock = mocker.patch(
            "ml_models.utils.logic.wait_for_task",
            return_value=wait_for_task_mock_return,
        )

        wait_for_task_result = run_predict_notebook(**params)

        post_mock.assert_called()
        wait_for_task_mock.assert_called()
        assert wait_for_task_result == wait_for_task_mock_return

    def test_no_input_dir(self, mocker):
        lf_project_id = "test_lf_project_id"
        model_obj = baker.prepare(MLModel, lf_project_id=lf_project_id)
        model_version_obj = baker.prepare(MLModelVersion, model=model_obj)
        task_kwargs = {}
        project_pk = 1
        project = baker.prepare(Project, pk=project_pk)
        task_pk = 1
        task_obj = baker.prepare(Task, kwargs=task_kwargs, project=project, pk=task_pk)
        token_value = "test_token"
        params = {
            "model_version": model_version_obj,
            "task": task_obj,
            "token": token_value,
        }
        post_mock_return = mocker.Mock()
        execid_value = "test_execid"
        post_mock_return.json = lambda: {"execid": execid_value}
        post_mock = mocker.patch(
            "ml_models.utils.logic.requests.post",
            return_value=post_mock_return,
        )
        wait_for_task_mock_return = "wait_for_task_result"
        wait_for_task_mock = mocker.patch(
            "ml_models.utils.logic.wait_for_task",
            return_value=wait_for_task_mock_return,
        )

        wait_for_task_result = run_predict_notebook(**params)

        post_mock.assert_called()
        wait_for_task_mock.assert_called()
        assert wait_for_task_result == wait_for_task_mock_return


class TestDestroyInstance:
    def test_destroy_instance(self, mocker):
        token = "test_token"
        machine_name = "test_machine_name"
        del_mock_return = {"test": "success"}
        del_mock = mocker.patch(
            "ml_models.utils.logic.requests.delete",
            return_value=del_mock_return,
        )

        destroy_instance_resp = destroy_instance(machine_name=machine_name, token=token)

        del_mock.assert_called_with(
            f"{settings.LF_SERVER_URL}/v1/clusters/gpu/{machine_name}",
            headers={"Authorization": token},
        )
        assert destroy_instance_resp == del_mock_return


class TestWaitForTask:
    def test_task_executed(self, mocker):
        execid = "test_execid"
        token = "test_token"
        get_mock_return = mocker.Mock()
        resp_result = {}
        get_mock_return.json.side_effect = (
            {"status": "started"},
            {"status": "complete", "result": resp_result},
        )
        mocker.patch(
            'ml_models.utils.logic.time.sleep'
        )
        get_mock = mocker.patch(
            "ml_models.utils.logic.requests.get",
            return_value=get_mock_return,
        )

        result = wait_for_task(execid=execid, token=token)

        get_mock.assert_called_with(
            f"{settings.LF_SERVER_URL}/v1/history/task/{execid}",
            headers={"Authorization": token}
        )
        assert result == resp_result 


    def test_task_error(self, mocker):
        execid = "test_execid"
        token = "test_token"
        get_mock_return = mocker.Mock()
        get_mock_return.json.side_effect = (
            {"status": "started"},
            {"status": "complete", "result": {"error": "test_error"}},
        )
        mocker.patch(
            'ml_models.utils.logic.time.sleep'
        )
        get_mock = mocker.patch(
            "ml_models.utils.logic.requests.get",
            return_value=get_mock_return,
        )

        with pytest.raises(RuntimeError):
            wait_for_task(execid=execid, token=token)

        get_mock.assert_called_with(
            f"{settings.LF_SERVER_URL}/v1/history/task/{execid}",
            headers={"Authorization": token}
        )
