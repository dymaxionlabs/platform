import json
import time

from django.conf import settings
import requests

from .constants import CREATE_INSTANCE_BODY, RUN_NOTEBOOK_BASE_BODY


def login():
    res = requests.post(
        f"{settings.LF_SERVER_URL}/v1/auth/login",
        data=json.dumps(
            {
                "username": settings.LF_USERNAME,
                "password": settings.LF_PASSWORD,
            }
        ),
    )
    body = res.json()
    return body["access_token"]


def create_instance_gpu(*, token: str):
    response = requests.post(
        f"{settings.LF_SERVER_URL}/v1/clusters",
        data=json.dumps(CREATE_INSTANCE_BODY),
        headers={"Authorization": token},
    )
    res = response.json()
    execid = res.get("jobid")
    result = wait_for_task(execid, token=token)
    return result["machine_name"]


def run_predict_notebook(*, model_version, task, token: str):
    lf_project_id = model_version.model.lf_project_id
    artifact_params = {
        "input_artifacts_url": task.input_artifacts_url,
        "output_artifacts_url": task.output_artifacts_url,
    }
    body = (
        RUN_NOTEBOOK_BASE_BODY
        | {"params": artifact_params | task.kwargs}
        | {"version": model_version.name}
    )
    response = requests.post(
        f"{settings.LF_SERVER_URL}/v1/workflows/{lf_project_id}/notebooks/_run",
        data=json.dumps(body),
        headers={"Authorization": token},
    )
    execid = response.json()["execid"]
    return wait_for_task(execid, token=token)


def destroy_instance(*, machine_name: str, token: str):
    return requests.delete(
        f"{settings.LF_SERVER_URL}/v1/clusters/gpu/{machine_name}",
        headers={"Authorization": token},
    )


def wait_for_task(execid: str, *, token: str):
    task_completed = False
    res = None
    while not task_completed:
        time.sleep(5)
        task_log_url = f"{settings.LF_SERVER_URL}/v1/history/task/{execid}"
        response = requests.get(task_log_url, headers={"Authorization": token})
        res = response.json()
        task_completed = res["status"] == "complete"
        if task_completed and res["result"].get("error"):
            raise RuntimeError(f"LF task failed: {res}")
    return res["result"]
