import os

from django.conf import settings
from django_rq import job

from terra.utils import run_subprocess
from estimators.models import Estimator


def run_cloudml(task, script_name):
    estimator = Estimator.objects.get(uuid=task.internal_metadata['estimator'])

    cloudml_env = {
        'CLOUDSDK_PYTHON':
        '/usr/bin/python3',
        'PATH':
        '{sdk_bin_path}/:{path}'.format(
            sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH, path=os.getenv('PATH')),
        'JOB_DIR':
        task.cloudml_job_url,
        'REGION':
        settings.CLOUDML_REGION,
        'PROJECT':
        settings.CLOUDML_PROJECT,
        'TERRA_TASK_ID':
        str(task.pk),
        'TERRA_TASK_ARTIFACTS_URL':
        task.artifacts_url,
        'TERRA_MODEL_URL':
        estimator.model_url,
        'TERRA_PUBSUB_TOPIC':
        settings.PUBSUB_JOB_TOPIC_ID,
        'SENTRY_SDK':
        os.environ['SENTRY_DNS'],
        'SENTRY_ENVIRONMENT':
        os.environ['SENTRY_ENVIRONMENT'],
    }

    # Set training parameters from estimator configuration object
    if estimator.configuration:
        epochs = estimator.configuration.get('epochs',
                                             settings.CLOUDML_DEFAULT_EPOCHS)
        steps = estimator.configuration.get('steps',
                                            settings.CLOUDML_DEFAULT_STEPS)
        cloudml_env['EPOCHS'] = str(round(epochs))
        cloudml_env['STEPS'] = str(round(steps))

    # Set default confidence score
    confidence = settings.CLOUDML_DEFAULT_PREDICTION_CONFIDENCE
    if 'confidence' in task.internal_metadata:
        confidence = task.internal_metadata['confidence']
    cloudml_env['CONFIDENCE'] = str(confidence)

    run_subprocess(script_name,
                   env=cloudml_env,
                   cwd=settings.CLOUDML_DIRECTORY)
