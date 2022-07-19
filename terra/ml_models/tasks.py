import json

from django.conf import settings
from requests import request
from terra.ml_models.constants import CREATE_INSTANCE_BODY, RUN_NOTEBOOK_BASE_BODY
from terra.ml_models.models import MLModelVersion
from terra.ml_models.utils import wait_for_lf_exec
from terra.tasks.models import Task

from tasks.utils import task


@task("default")
def predict(task: Task):
    model_version = MLModelVersion.objects.get(pk=task.kwargs["ml_model_version_id"])
    machine_name = create_instance_gpu()
    run_predict_notebook(model_version)
    destroy_instance(machine_name)


def create_instance_gpu():
    res = request.post(
        f"{settings.LF_SERVER_URL}/v1/clusters",
        data=json.dumps(CREATE_INSTANCE_BODY),
    )
    execid = res.json().get("jobid")
    res = wait_for_lf_exec(execid)
    result = res.json().get("result")
    return result["name"]


def run_predict_notebook(model_version):
    artifact_params = {
        "input_artifacts_url": task.input_artifacts_url,
        "output_artifacts_url": task.output_artifacts_url,
    }
    body = (
        RUN_NOTEBOOK_BASE_BODY
        | {"params": artifact_params | task.kwargs}
        | {"version": model_version.name}
    )
    res = request.post(
        f"{settings.LF_SERVER_URL}/v1/workflows/{model_version.model.lf_project_id}/notebooks/_run",
        data=json.dumps(body),
    )
    execid = res.json().get("execid")
    return wait_for_lf_exec(execid)


def destroy_instance(machine_name):
    return request.delete(f"{settings.LF_SERVER_URL}/v1/clusters/gpu/{machine_name}")
