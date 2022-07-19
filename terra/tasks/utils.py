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

            task = Task.objects.get(pk=job_pk)

            try:
                func(task)
            except Exception as err:
                tb = traceback.format_exc()
                task.mark_as_failed(reason=err, traceback=tb)
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


def enqueue_task(method, project_id=None,**kwargs):
    from tasks.models import Task

    logger.info("Create task %s with kwargs: %s", method, kwargs)
    task = Task.objects.create(name=method, kwargs=kwargs, project_id=project_id)
    logger.info("Start task")
    task.start()
    return task