import logging
import subprocess
import sys
import traceback

import django_rq

# Configure logger
logger = logging.getLogger(__name__)
out_handler = logging.StreamHandler(sys.stdout)
out_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
out_handler.setLevel(logging.INFO)
logger.addHandler(out_handler)
logger.setLevel(logging.INFO)


def task(func_or_queue, connection=None, *args, **kwargs):
    """Task decorator"""

    def wrapper(func):
        def monitored_func(job_pk, sync=False):
            from tasks.models import Task
            from tasks import states

            task = Task.objects.get(pk=job_pk)
            task.mark_as_in_progress()

            try:
                func(task)
            except Exception as err:
                tb = traceback.format_exc()
                # FIXME: Add column traceback (see other project)
                # task.mark_as_failed(reason=err, traceback=tb)
                task.mark_as_failed(reason=err)
                if sync:
                    raise err
            else:
                task.mark_as_finished()

        rq_job_wrapper = django_rq.job(
            func_or_queue, connection=connection, *args, **kwargs
        )
        return rq_job_wrapper(monitored_func)

    return wrapper


def run_command(cmd):
    logging.info(cmd)
    subprocess.run(cmd, shell=True, check=True)


def enqueue_rq_job(method, *args, queue_name="default", timeout=None, **kwargs):
    if not timeout:
        timeout = 60 * 60 * 24
    queue = django_rq.get_queue(queue_name)
    queue.enqueue(method, *args, **kwargs, job_timeout=timeout)


def enqueue_task(method, project_id=None, **kwargs):
    from tasks.models import Task

    logger.info("Create task %s with kwargs: %s", method, kwargs)
    task = Task.objects.create(name=method, kwargs=kwargs, project_id=project_id)
    logger.info("Start task")
    task.start()
    return task
