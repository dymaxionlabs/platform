from datetime import datetime
from django_rq import job
from estimators.models import Estimator, Annotation
from storage.models import File
from tasks.models import Task, TaskLogEntry


@job("default", timeout=3600)
def import_from_vector_file(task_id):
    job = Task.objects.get(pk=task_id)
    try:
        image_file = File.objects.filter(project=job.project, path=job.kwargs['image_file'], complete=True).first()
        vector_file = File.objects.filter(project=job.project, path=job.kwargs['vector_file'], complete=True).first()
        Annotation.import_from_vector_file(
            job.project,
            vector_file,
            image_file,
            estimator=Estimator.objects.get(uuid=job.kwargs["estimator"]),
            label=job.kwargs['label'],
            label_property=job.kwargs['label_property']
        )
    except Exception as err:
        err_msg = str(err)
        TaskLogEntry.objects.create(task=job,
                                    log=dict(error=err_msg),
                                    logged_at=datetime.now())
        print(f"Error: {err_msg}")
        job.mark_as_failed(reason=err_msg)
    else:
        job.mark_as_finished()