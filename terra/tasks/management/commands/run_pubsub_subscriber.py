import json
import time
from datetime import datetime

from django.conf import settings
from django.core.management.base import BaseCommand
from google.cloud import pubsub_v1

from common.utils import gsutilCopy
from tasks.models import Task, TaskLogEntry


class Command(BaseCommand):
    help = 'Creates Files for each blob in user storage (deprecated)'

    def handle(self, *args, **options):
        client = pubsub_v1.SubscriberClient()
        subscription_path = client.subscription_path(
            settings.PUBSUB_PROJECT_ID, settings.PUBSUB_JOB_TOPIC_ID)

        def callback(message):
            self.stdout.write(f'Job log: {message.data}')
            try:
                data = json.loads(message.data.decode('utf8'))

                task_id = data.get("task_id")
                if not task_id:
                    self.stdout.write(f'Message with no task id: {data}')
                    return

                task = Task.objects.filter(pk=int(task_id)).first()
                if task is not None:
                    payload = data['payload']
                    TaskLogEntry.objects.create(
                        task=task,
                        log=payload,
                        logged_at=datetime.strptime(data["logged_at"],
                                                    '%Y-%m-%d %H:%M:%S.%f'),
                    )
                    if task.is_running():
                        # Only mark as finished or failed if task is still running,
                        # otherwise, message may be too old and should be ignored.
                        if payload.get('done'):
                            task.mark_as_finished()
                        elif payload.get('failed'):
                            task.mark_as_failed()
                else:
                    self.stdout.write(f'Unknow Task message: {message.data}')
            except Exception as err:
                raise err
            else:
                message.ack()

        self.stdout.write(f"Subscribe to: {subscription_path}")
        client.subscribe(subscription_path, callback=callback)

        self.stdout.write("Waiting for completed tasks...")
        while True:
            time.sleep(30)
