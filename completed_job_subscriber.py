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
from projects.models import File
#from terra.emails import TrainingCompletedEmail


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def trainingJobFinished(job_id):
    training_job = TrainingJob.objects.get(pk=job_id)
    training_job.finished = True
    training_job.save()
    print("Training job finished {}".format(job_id))
    print("TODO: Send emails")
    """
    users = training_job.estimator.project.owners.all()
    email = TrainingCompletedEmail(estimator=training_job.estimator,
                                recipients=[user.email for user in users],
                                language_code='es')
    email.send_mail()
    """
    pass


def createFileIfExists(name, image, files, job, tmpdirname):
    if name in files:
        resut_file = File.objects.create(
            owner=image.owner,
            project=image.project,
            name=name
        )
        with open(os.path.join(tmpdirname, name), "rb") as f:
            resut_file.file = DjangoFile(f, name=name)
            resut_file.save()
        job.result_files.add(resut_file)


def predictionJobFinished(job_id):
    print("Prediction job finished {}".format(job_id))
    job = PredictionJob.objects.get(pk=job_id)

    with tempfile.TemporaryDirectory() as tmpdirname:
        run_subprocess('gsutil -m cp -r {predictions_url}* {dst}'.format(
            predictions_url=job.predictions_url, dst=tmpdirname))
        files = os.listdir(tmpdirname)

        for image in job.image_files.all():
            createFileIfExists("{}.csv".format(image.name), image, files, job, tmpdirname)
            createFileIfExists("{}.json".format(image.name), image, files, job, tmpdirname)
    
    #TODO: Send emails


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