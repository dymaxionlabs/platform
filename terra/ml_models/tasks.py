from requests import request
from tasks.utils import task
import time
import json
from django.conf import settings
from terra.ml_models.constants import CREATE_INSTANCE_BODY, RUN_NOTEBOOK_BASE_BODY
from terra.ml_models.models import MLModelVersion
from terra.ml_models.utils import wait_for_lf_exec

from terra.tasks.models import Task

@task("default")
def predict(task: Task):
    create_instance_url = f"{settings.LABFUNCTIONS_URL}/v1/clusters"
    create_instance_response = request.post(
        create_instance_url, data=json.dumps(CREATE_INSTANCE_BODY)
    )
    create_instance_exec_id = create_instance_response.json().get("jobid")
    wait_for_lf_resp = wait_for_lf_exec(create_instance_exec_id)
    model_version = MLModelVersion.objects.get(pk=task.kwargs["version_id"])
    run_notebook_url = f"{settings.LABFUNCTIONS_URL}/v1/workflows/{model_version.model.lf_project_id}/notebooks/_run"
    ARTIFACTS = {
        "input_artifacts_url": task.input_artifacts_url,
        "output_artifacts_url": task.output_artifacts_url,
    }
    RUN_NOTEBOOK_BODY = RUN_NOTEBOOK_BASE_BODY | {"params": ARTIFACTS | task.kwargs} | {
        "version": model_version.name
    }
    run_notebook_response = request.post(
        run_notebook_url, data=json.dumps(RUN_NOTEBOOK_BODY)
    )
    run_notebook_exec_id = run_notebook_response.json().get("execid")
    wait_for_lf_exec(run_notebook_exec_id)
    machine_name = wait_for_lf_resp.json()["result"]["name"]
    delete_instance_url = f"{settings.LABFUNCTIONS_URL}/v1/clusters/gpu/{machine_name}"
    delete_instance_resp = request.delete(delete_instance_url)