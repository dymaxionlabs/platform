#!/usr/bin/env python3
import django
import json
import os
import time
import subprocess
import tempfile
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()

from django.conf import settings
from django.core.files import File as DjangoFile
from estimators.models import Estimator
from google.cloud import pubsub_v1
from projects.models import File, Map, Layer, MapLayer
from terra.emails import TrainingCompletedEmail
from terra.emails import PredictionCompletedEmail
from tasks.models import Task, TaskLogEntry
from tasks import states
from storage.client import Client
from common.utils import gsutilCopy


def sendPredictionJobCompletedEmail(job):
    estimator = Estimator.objects.get(uuid=job.internal_metadata["estimator"])
    users = estimator.project.collaborators.all()
    users = [user for user in users if user.userprofile.send_notification_emails]
    email = PredictionCompletedEmail(estimator=estimator,
                                     recipients=[user.email for user in users])
    email.send_mail()


def sendTrainingJobCompletedEmail(job):
    estimator = Estimator.objects.get(uuid=job.internal_metadata["estimator"])
    users = estimator.project.collaborators.all()
    users = [user for user in users if user.userprofile.send_notification_emails]
    email = TrainingCompletedEmail(estimator=estimator,
                                   recipients=[user.email for user in users])
    email.send_mail()


def trainingJobFinished(job_id):
    job = Task.objects.get(pk=job_id)
    job.mark_as_finished()
    sendTrainingJobCompletedEmail(job)


def createFile(name, image, tmpdirname, metadata):
    ext = os.path.splitext(name)[1]
    if ext in ['.json', '.geojson']:
        metadata['class'] = name.split("_")[0]
    filename = File.prepare_filename(name)
    resut_file = File.objects.create(owner=image.owner,
                                     project=image.project,
                                     name=filename,
                                     metadata=metadata)
    with open(os.path.join(tmpdirname, name), "rb") as f:
        resut_file.file = DjangoFile(f, name=filename)
        resut_file.save()
    return resut_file


def predictionJobFinished(job_id):
    print("Prediction job finished {}".format(job_id))
    job = Task.objects.get(pk=job_id)
    job.mark_as_finished()

    client = Client(job.project)
    if job.metadata is None:
        job.metadata = {}
    with tempfile.TemporaryDirectory() as tmpdirname:
        gsutilCopy('{job_dir}/predictions/*'.format(job_dir=job.job_dir),
                   tmpdirname)
        images_files = []
        for file_path in job.internal_metadata['image_files']:
            files = list(client.list_files(file_path))
            if files:
                images_files.append(files[0])
        job.metadata['results_files'] = []
        for img in images_files:
            predictions_url = '{job_dir}/predictions/{img_folder}/'.format(
                job_dir=job.job_dir, img_folder=img.name)
            results_dst = 'gs://{bucket}/project_{project_id}/{output_path}/'.format(
                bucket=settings.FILES_BUCKET,
                project_id=job.project.pk,
                output_path=job.internal_metadata['output_path'].rstrip('/'))
            gsutilCopy("{}*".format(predictions_url), results_dst)
            """
            result_map = Map.objects.create(
                project=img.project,
                name='{prediction_pk}_{img_name}'.format(prediction_pk=job.pk,
                                                         img_name=img.name))
            img_layer = Layer.objects.filter(file=img).first()
            if img_layer is not None:
                MapLayer.objects.create(map=result_map,
                                        layer=img_layer,
                                        order=1)
            meta = {
                'source_img': {
                    'pk': img.pk,
                    'name': img.name
                },
                'map': {
                    'uuid': str(result_map.uuid)
                }
            }
            """
            results_path = os.path.sep.join([tmpdirname, img.name])
            files = os.listdir(results_path)
            #order = 2
            for f in files:
                #meta['map']['layer_order'] = order
                #order += 1
                print("f")
                print(f)
                path, name = os.path.split(img.path)
                #result_file = createFile(f, img, results_path, meta)
                job.metadata['results_files'].append('{}/{}'.format(
                    job.internal_metadata['output_path'].rstrip('/'), f))

        job.save(update_fields=['internal_metadata', 'metadata', 'updated_at'])
    sendPredictionJobCompletedEmail(job)


def subscriber():
    client = pubsub_v1.SubscriberClient()
    subscription_path = client.subscription_path(settings.PUBSUB_PROJECT_ID,
                                                 settings.PUBSUB_JOB_TOPIC_ID)

    def callback(message):
        print('[Subscriptor] Job log: {}'.format(message.data))
        message.ack()
        data = json.loads(message.data.decode('utf8'))
        task = Task.objects.filter(pk=int(data["job_id"])).first()
        if task is not None:
            TaskLogEntry.objects.create(
                task=task,
                log=data["payload"],
                logged_at=datetime.strptime(data["logged_at"],
                                            '%Y-%m-%d %H:%M:%S.%f'),
            )
            if "done" in data["payload"]:
                if "job_type" in data:
                    if data['job_type'] == 'training':
                        trainingJobFinished(data['job_id'])
                    elif data['job_type'] == 'prediction':
                        predictionJobFinished(data['job_id'])
            if "failed" in data["payload"]:
                task.mark_as_failed()

        else:
            print('[Subscriptor] Unknow message: {}'.format(message.data))

    print("Subscribe to:", subscription_path)
    client.subscribe(subscription_path, callback=callback)

    print("Waiting for completed jobs...")
    while True:
        time.sleep(30)


if __name__ == '__main__':
    subscriber()
