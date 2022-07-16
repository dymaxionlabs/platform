from requests import request
from tasks.utils import task
import time
import json
from django.conf import settings
from terra.ml_models.constants import CREATE_INSTANCE_BODY, RUN_NOTEBOOK_BODY
from terra.ml_models.utils import wait_for_lf_exec

from terra.tasks.models import Task

@task("default")
def predict(task: Task):
    create_instance_url = f"{settings.LABFUNCTIONS_URL}/v1/clusters"
    create_instance_response = request.post(
        create_instance_url, data=json.dumps(CREATE_INSTANCE_BODY)
    )
    create_instance_exec_id = create_instance_response.json().get("jobid")
    wait_for_lf_exec(create_instance_exec_id)
    lf_project_id = "1rxw10tzcq"
    run_notebook_url = f"{settings.LABFUNCTIONS_URL}/v1/workflows/{lf_project_id}/notebooks/_run"
    run_notebook_response = request.post(
        run_notebook_url, data=json.dumps(RUN_NOTEBOOK_BODY)
    )
    run_notebook_exec_id = run_notebook_response.json().get("execid")
    wait_for_lf_resp = wait_for_lf_exec(run_notebook_exec_id)
    machine_name = wait_for_lf_resp.json()["result"]["name"]
    delete_instance_url = f"{settings.LABFUNCTIONS_URL}/v1/clusters/gpu/{machine_name}"
    delete_instance_resp = request.delete(delete_instance_url)
    assert delete_instance_resp.json()["jobid"]