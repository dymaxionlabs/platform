from django.utils.dateparse import parse_datetime
from django_cron import CronJobBase, Schedule

from tasks import states
from tasks.clients import CloudMLClient
from tasks.models import Task


class UpdateCloudMLTasksCronJob(CronJobBase):
    help = 'Update status of running Cloud ML-based tasks'

    RUN_EVERY_MINS = 5

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
            print("No running tasks. Do nothing")
            return
        print("Running tasks:", count)

        # Get all CloudML jobs
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
            job = jobs_by_task_id[task.pk]
            state = job['state']
            # Use real endTime as finished_at, not current time
            finished_at = parse_datetime(job['endTime']
            if state == 'SUCCEEDED':
                task.mark_as_finished(finished_at=finished_at)
            if state in ['CANCELLING', 'CANCELED']:
                task.mark_as_canceled(finished_at=finished_at)
            if state == 'FAILED':
                task.mark_as_failed(finished_at=finished_at)
