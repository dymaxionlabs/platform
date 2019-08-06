import django
import os
import time
from google.cloud import pubsub_v1
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()
from django.conf import settings
from estimators.models import TrainingJob
from terra.emails import TrainingCompletedEmail

def subscriber():
    client = pubsub_v1.SubscriberClient()
    subscription_path = client.subscription_path(
        settings.PUBSUB_PROJECT_ID, settings.SUBSCRIPTION_NAME)
    
    def callback(message):
        print('[Subscriptor] TrainingJob {} completed'.format(message.data))
        message.ack()
        training_job = TrainingJob.objects.get(pk=int(message.data))
        training_job.finished = True
        training_job.save()
        users = training_job.estimator.project.owners.all()
        email = TrainingCompletedEmail(estimator=training_job.estimator,
                                    recipients=[user.email for user in users],
                                    language_code='es')
        email.send_mail()

    client.subscribe(subscription_path, callback=callback)
    print("Waiting for completed jobs...")
    while True:
        time.sleep(30)


if __name__ == '__main__':
    subscriber()