import os
import tempfile

import django_rq
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from common.utils import gsutilCopy
from projects.models import File
from quotas.models import UserQuota
from storage.models import File
from storage.client import Client
from tasks.models import Task
from tasks.signals import task_finished
from terra.emails import TrainingCompletedEmail, PredictionCompletedEmail

from .models import Estimator, PredictionJob, TrainingJob


@receiver(post_save, sender=TrainingJob)
def start_training_job(sender, instance, created, **kwargs):
    if created:
        django_rq.enqueue('estimators.tasks.start_training_job', instance.pk)


@receiver(pre_save, sender=Estimator)
def pre_save_handler(sender, instance, *args, **kwargs):
    quota = UserQuota.objects.get(user=instance.project.owner)
    created_estimators = Estimator.objects.filter(
        project=instance.project).count()
    if created_estimators >= quota.max_estimator_per_project:
        raise Exception(
            'Quota exceeded - You can only create {} estimators per project'.
            format(quota.max_estimator_per_project))


@receiver(task_finished, sender=Task)
def perform_train_predict_post_processing(sender, task, **kwargs):
    # TODO: These should be rq jobs...
    if task.name == Estimator.TRAINING_JOB_TASK:
        post_process_training_task(task)
    elif task.name == Estimator.PREDICTION_JOB_TASK:
        post_process_prediction_task(task)


def post_process_training_task(task):
    send_training_job_completed_email(task)


def post_process_prediction_task(task):
    print(f"Prediction job finished {task.pk}")

    client = Client(task.project)

    if task.metadata is None:
        task.metadata = {}

    with tempfile.TemporaryDirectory() as tmpdirname:
        gsutilCopy(f'{task.job_dir}/predictions/*', tmpdirname)
        images_files = []
        for file_path in task.internal_metadata['image_files']:
            files = list(client.list_files(file_path))
            if files:
                images_files.append(files[0])
        task.metadata['results_files'] = []
        for img in images_files:
            predictions_url = f'{task.job_dir}/predictions/{img.name}/'
            results_dst = 'gs://{bucket}/project_{project_id}/{output_path}/'.format(
                bucket=settings.FILES_BUCKET,
                project_id=task.project.pk,
                output_path=task.internal_metadata['output_path'].rstrip('/'))
            gsutilCopy(f"{predictions_url}*", results_dst)

            results_path = os.path.sep.join([tmpdirname, img.name])
            files = os.listdir(results_path)
            for f in files:
                create_file(
                    f, results_path, task.project, '{}/{}'.format(
                        task.internal_metadata['output_path'].rstrip('/'), f))
                task.metadata['results_files'].append('{}/{}'.format(
                    task.internal_metadata['output_path'].rstrip('/'), f))

        task.save(
            update_fields=['internal_metadata', 'metadata', 'updated_at'])

    send_prediction_job_completed_email(task)


def create_file(name, tmpdirname, project, path, metadata={}):
    ext = os.path.splitext(name)[1]
    if ext in ['.json', '.geojson']:
        metadata['class'] = name.split("_")[0]
    with open(os.path.join(tmpdirname, name), "rb") as f:
        file = File.objects.get_or_create(
            project=project,
            path=path,
            defaults={
                'size': os.path.getsize(os.path.join(tmpdirname, name)),
                'metadata': metadata
            })
    return file


def send_training_job_completed_email(task):
    estimator = Estimator.objects.get(uuid=task.internal_metadata["estimator"])
    users = estimator.project.collaborators.all()
    users = [
        user for user in users if user.userprofile.send_notification_emails
    ]
    email = TrainingCompletedEmail(estimator=estimator,
                                   recipients=[user.email for user in users])
    email.send_mail()


def send_prediction_job_completed_email(task):
    estimator = Estimator.objects.get(uuid=task.internal_metadata["estimator"])
    users = estimator.project.collaborators.all()
    users = [
        user for user in users if user.userprofile.send_notification_emails
    ]
    email = PredictionCompletedEmail(estimator=estimator,
                                     recipients=[user.email for user in users])
    email.send_mail()
