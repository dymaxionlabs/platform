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


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def sendPredictionJobCompletedEmail(job, map):
    estimator = Estimator.objects.get(uuid=job.internal_metadata["estimator"])
    users = estimator.project.owners.all()
    email = PredictionCompletedEmail(estimator=estimator,
                                     map=map,
                                     recipients=[user.email for user in users],
                                     language_code='es')
    email.send_mail()


def sendTrainingJobCompletedEmail(job):
    estimator = Estimator.objects.get(uuid=job.internal_metadata["estimator"])
    users = estimator.project.owners.all()
    email = TrainingCompletedEmail(estimator=estimator,
                                   recipients=[user.email for user in users],
                                   language_code='es')
    email.send_mail()


def trainingJobFinished(job_id):
    job = Task.objects.get(pk=job_id)
    job.state = states.FINISHED
    job.save(update_fields=['state', 'updated_at'])
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
    job.state = states.FINISHED
    job.save(update_fields=['state', 'updated_at'])

    with tempfile.TemporaryDirectory() as tmpdirname:
        run_subprocess(
            '{sdk_bin_path}/gsutil -m cp -r {predictions_url}* {dst}'.format(
                sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
                predictions_url='{job_dir}/predictions/'.format(
                    job_dir=job.job_dir),
                dst=tmpdirname))

        images_files = File.objects.filter(
            project=job.project, name__in=job.internal_metadata['image_files'])
        job.internal_metadata['results_files'] = []
        for img in images_files:
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
            results_path = os.path.sep.join([tmpdirname, img.name])
            files = os.listdir(results_path)
            order = 2
            for f in files:
                meta['map']['layer_order'] = order
                order += 1
                result_file = createFile(f, img, results_path, meta)
                job.internal_metadata['results_files'].append(result_file.name)

        job.save(update_fields=['internal_metadata', 'updated_at'])
    sendPredictionJobCompletedEmail(job, result_map)


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
                task.state = states.FAILED
                task.save(update_fields=['state', 'updated_at'])

        else:
            print('[Subscriptor] Unknow message: {}'.format(message.data))

    print("Subscribe to:", subscription_path)
    client.subscribe(subscription_path, callback=callback)

    print("Waiting for completed jobs...")
    while True:
        time.sleep(30)


if __name__ == '__main__':
    subscriber()
