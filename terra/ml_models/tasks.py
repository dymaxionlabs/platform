import logging

from tasks.models import Task
from tasks.utils import task

from .labfunctions import (
    create_instance_gpu,
    destroy_instance,
    login,
    run_predict_notebook,
)
from .models import MLModelVersion

logger = logging.getLogger(__name__)


@task("default")
def predict(task: Task):
    model_version = MLModelVersion.objects.get(pk=task.kwargs["ml_model_version_id"])

    token = login()
    logger.info("Logged in Lab Functions server")

    logger.info("Creating a new GPU VM...")
    machine_name = create_instance_gpu(token=token)
    logger.info(f"Machine {machine_name} created")

    logger.info(f"Running prediction notebook for {model_version}")
    run_predict_notebook(model_version=model_version, task=task, token=token)
    logger.info(f"Prediction run succesfully for {model_version}")

    logger.info(f"Destroy VM {machine_name}")
    destroy_instance(machine_name=machine_name, token=token)
