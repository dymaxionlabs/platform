from django.utils.dateparse import parse_datetime
from django_cron import CronJobBase, Schedule

from tasks import states
from tasks.clients import CloudMLClient
from tasks.models import Task


class UpdateCloudMLTasksCronJob(CronJobBase):
    help = 'Update status of running Cloud ML-based tasks'

    RUN_EVERY_MINS = 5
    INVALID_TASK_EXPIRATION_TIME = 15 * 60

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'tasks.cron.update_cloudml_tasks'  # a unique code

    def do(self):
        client = CloudMLClient()

        # Look for running Tasks of type TRAIN or PREDICT
        cloudml_tasks = Task.objects.filter(
            internal_metadata__uses_cloudml=True,
            state__in=[states.PENDING, states.STARTED])
        count = cloudml_tasks.count()

        if count == 0:
            return
        print("Running tasks:", count)

        # Get all CloudML jobs
        # TODO: Filter by date of oldest running task...
        all_jobs = client.list_jobs()['jobs']
        print("CloudML jobs:", len(all_jobs))

        jobs_by_task_id = [(job['jobId'].split('_')[1], job)
                           for job in all_jobs]
        jobs_by_task_id = {
            int(id): job
            for id, job in jobs_by_task_id if id.isnumeric()
        }

        # For each task, get the corresponding Cloud ML Job
        # If CloudML job has finished, update state of task
        for task in cloudml_tasks:
            # Ref: https://cloud.google.com/ai-platform/training/docs/reference/rest/v1/projects.jobs#State
            job = jobs_by_task_id.get(task.pk)
            task_is_too_old = task.age > self.INVALID_TASK_EXPIRATION_TIME
            if not job:
                if task_is_too_old:
                    print(
                        f'Task {task.pk} has no related CloudML and is old (started at {task.created_at}). Mark as failed.'
                    )
                    task.mark_as_failed()
                    return
                else:
                    continue

            state = job['state']
            print(f'Task {task.pk} has a CloudML job with state {state}')

            # Use real endTime as finished_at, not current time
            finished_at = parse_datetime(job['endTime'])
            if state == 'SUCCEEDED':
                print(f'Task {task.pk}: Mark as finished at {finished_at}')
                task.mark_as_finished(finished_at=finished_at)
            if state in ['CANCELLING', 'CANCELED']:
                print(f'Job {task.pk}: Mark as canceled at {finished_at}')
                task.mark_as_canceled(finished_at=finished_at)
            if state == 'FAILED':
                print(f'Job {task.pk}: Mark as failed at {finished_at}')
                task.mark_as_failed(finished_at=finished_at)
