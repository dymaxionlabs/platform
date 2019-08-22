import django
import json
import os
import time
from google.cloud import pubsub_v1
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()
from django.conf import settings
from estimators.models import TrainingJob
from terra.emails import TrainingCompletedEmail


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


def predictionJobFinished(job_id):
    print("Prediction job finished {}".format(job_id))
    print("TODO: Not implemented yet.")
    pass


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
    subscriber()