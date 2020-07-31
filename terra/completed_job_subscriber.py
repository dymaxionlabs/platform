#!/usr/bin/env python3
import json
import os
import subprocess
import tempfile
import time
from datetime import datetime

import django
from django.conf import settings
from django.core.files import File as DjangoFile
from dotenv import load_dotenv
from google.cloud import pubsub_v1

from common.utils import gsutilCopy
from estimators.models import Estimator
from projects.models import Layer, Map, MapLayer
from storage.client import Client
from storage.models import File
from tasks import states
from tasks.models import Task, TaskLogEntry
from terra.emails import PredictionCompletedEmail, TrainingCompletedEmail

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()


def subscriber():
    client = pubsub_v1.SubscriberClient()
    subscription_path = client.subscription_path(settings.PUBSUB_PROJECT_ID,
                                                 settings.PUBSUB_JOB_TOPIC_ID)

    def callback(message):
        print('[Subscriptor] Job log: {}'.format(message.data))
        try:
            data = json.loads(message.data.decode('utf8'))
            task = Task.objects.filter(pk=int(data["job_id"])).first()
            if task is not None:
                TaskLogEntry.objects.create(
                    task=task,
                    log=data["payload"],
                    logged_at=datetime.strptime(data["logged_at"],
                                                '%Y-%m-%d %H:%M:%S.%f'),
                )
            else:
                print('[Subscriptor] Unknow message: {}'.format(message.data))
        except Exception as err:
            raise err
        else:
            message.ack()

    print("Subscribe to:", subscription_path)
    client.subscribe(subscription_path, callback=callback)

    print("Waiting for completed jobs...")
    while True:
        time.sleep(30)


if __name__ == '__main__':
    subscriber()
