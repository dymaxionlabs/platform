import django
import json
import os
import time
import subprocess
import tempfile
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()
from django.conf import settings
from django.core.files import File as DjangoFile
from estimators.models import TrainingJob, PredictionJob
from google.cloud import pubsub_v1
from projects.models import File, Map, Layer, MapLayer
from terra.emails import TrainingCompletedEmail
from terra.emails import PredictionCompletedEmail


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def sendPredictionJobCompletedEmail(job, map):
    users = job.estimator.project.owners.all()
    email = PredictionCompletedEmail(estimator=job.estimator,
                    map=map,
                    recipients=[user.email for user in users],
                    language_code='es')
    email.send_mail()

def sendTrainingJobCompletedEmail(job):
    users = job.estimator.project.owners.all()
    email = TrainingCompletedEmail(estimator=job.estimator,
                    recipients=[user.email for user in users],
                    language_code='es')
    email.send_mail()

def trainingJobFinished(job_id):
    training_job = TrainingJob.objects.get(pk=job_id)
    training_job.finished = True
    training_job.save()
    sendTrainingJobCompletedEmail(training_job)


def createFile(name, image, tmpdirname, metadata):
    ext = name.split(".")[-1]
    if ext == 'json':
        metadata['class'] = name.split("_")[0]
    resut_file = File.objects.create(
        owner=image.owner,
        project=image.project,
        name=name,
        metadata=metadata
    )
    with open(os.path.join(tmpdirname, name), "rb") as f:
        resut_file.file = DjangoFile(f, name=name)
        resut_file.save()
    return resut_file


def predictionJobFinished(job_id):
    print("Prediction job finished {}".format(job_id))
    job = PredictionJob.objects.get(pk=job_id)

    with tempfile.TemporaryDirectory() as tmpdirname:
        run_subprocess('gsutil -m cp -r {predictions_url}* {dst}'.format(
            predictions_url=job.predictions_url, dst=tmpdirname))

        for img in job.image_files.all():
            result_map = Map.objects.create(
                project = img.project,
                name = img.name,
            )
            img_layer = Layer.objects.filter(file=img).first()
            if img_layer is not None:
                MapLayer.objects.create(
                    map = result_map,
                    layer = img_layer,
                    order = 1
                )
            meta = { 
                'source_img': {
                    'pk': img.pk,
                    'name': img.name
                },
                'map': {
                    'uuid': str(result_map.uuid)
                }
            }
            results_path = os.path.sep.join([tmpdirname,img.name])
            files = os.listdir(results_path)
            order = 2
            for f in files:
                meta['map']['layer_order'] = order
                order += 1
                job.result_files.add(createFile(f, img, results_path, meta))

    sendPredictionJobCompletedEmail(job, result_map)


def subscriber():
    client = pubsub_v1.SubscriberClient()
    subscription_path = client.subscription_path(
        settings.PUBSUB_PROJECT_ID, settings.SUBSCRIPTION_NAME)
    
    def callback(message):
        print('[Subscriptor] Job completed: {}'.format(message.data))
        message.ack()
        data = json.loads(message.data.decode('utf8'))
        if data['type']=='training-job':
            trainingJobFinished(data['job_id'])
        elif data['type']=='prediction-job':
            predictionJobFinished(data['job_id'])

    client.subscribe(subscription_path, callback=callback)
    print("Waiting for completed jobs...")
    while True:
        time.sleep(30)


if __name__ == '__main__':
    predictionJobFinished(1)