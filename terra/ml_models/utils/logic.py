import json
import logging
import time

import requests
from django.conf import settings

from .constants import CREATE_INSTANCE_BODY, RUN_NOTEBOOK_BASE_BODY

logger = logging.getLogger(__name__)


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

    # If reserved `input_dir` parameter was specified, use that as path prefix on user storage
    user_params = task.kwargs.get("user_params", {})
    input_dir = user_params.get("input_dir", None)
    input_url = (
        f"gs://{settings.FILES_BUCKET}/project_{task.project.pk}/{input_dir.strip('/')}"
        if input_dir
        else ""
    )

    artifact_params = {
        "INPUT_ARTIFACTS_URL": input_url if input_dir else task.input_artifacts_url,
        "OUTPUT_ARTIFACTS_URL": task.output_artifacts_url,
    }
    user_params_upper = {k.upper(): v for k, v in user_params.items()}
    run_notebook_body = (
        RUN_NOTEBOOK_BASE_BODY
        | {"params": artifact_params | user_params_upper}
        | {"version": model_version.name}
    )
    logger.info(f"Parameters: {run_notebook_body['params']}")

    response = requests.post(
        f"{settings.LF_SERVER_URL}/v1/workflows/{lf_project_id}/notebooks/_run",
        data=json.dumps(run_notebook_body),
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
        task_completed = res["status"] in ("complete", "failed")
        if task_completed and res["result"].get("error", False):
            raise RuntimeError(f"LF task failed: {res}")
    return res["result"]
