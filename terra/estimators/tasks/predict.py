import json
import os
import tempfile

import rasterio
from django.conf import settings
from django_rq import job
from datetime import datetime

from terra.utils import gsutilCopy, list_chunks
from estimators.models import Estimator, ImageTile
from storage.client import GCSClient
from tasks.models import Task, TaskLogEntry

from . import run_cloudml


@job("default")
def start_prediction_job(task_id):
    task = Task.objects.get(pk=task_id)
    try:
        prepare_artifacts(task)
        job_name = f'predict_{task_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        task.internal_metadata.update(uses_cloudml=True)
        run_cloudml(task, './submit_prediction_job.sh', job_name)
        task.internal_metadata.update(cloudml_job_name=job_name)
        task.save(update_fields=["internal_metadata"])
    except Exception as err:
        err_msg = str(err)
        TaskLogEntry.objects.create(task=task,
                            log=dict(error=err_msg),
                            logged_at=datetime.now())
        print(f"Error: {err_msg}")
        task.mark_as_failed(reason=err_msg


def prepare_artifacts(task):
    training_task = Task.objects.get(pk=task.kwargs['training_job'])
    csv_url = os.path.join(training_task.input_artifacts_url, 'classes.csv')
    gsutilCopy(csv_url, task.input_artifacts_url, recursive=False)

    estimator = Estimator.objects.get(uuid=task.kwargs["estimator"])
    gsutilCopy(estimator.model_url, task.input_artifacts_url)

    upload_prediction_image_tiles(task)


def upload_prediction_image_tiles(task):
    client = GCSClient(task.project)
    task.kwargs["image_files"] = []
    for path in task.kwargs['tiles_folders']:
        image_tiles = ImageTile.objects.filter(project=task.project,
                                               source_tile_path=path)
        if image_tiles.count() == 0:
            raise Exception("There are no tiles to predict. Please check your input.")
        if image_tiles.first() is not None:
            source_file = image_tiles.first().source_image_file
            if source_file not in task.kwargs["image_files"]:
                task.kwargs["image_files"].append(source_file)
            files = list(client.list_files(source_file))
            image_tile_urls = []
            meta_data = {}
            with tempfile.NamedTemporaryFile() as tmpfile:
                src = tmpfile.name
                files[0].download_to_filename(src)
                with rasterio.open(src) as dataset:
                    if dataset.driver == 'GTiff':
                        meta_data['tiff_data'] = {
                            'width': dataset.width,
                            'heigth': dataset.height,
                            'transform': dataset.transform,
                            'crs': str(dataset.crs)
                        }

            for t in image_tiles:
                image_tile_urls.append('gs://{bucket}/{name}'.format(
                    bucket=settings.GS_BUCKET_NAME, name=t.tile_file.name))
                meta_data[os.path.basename(t.tile_file.name)] = {
                    'col_off': t.col_off,
                    'row_off': t.row_off,
                    'width': t.width,
                    'height': t.height,
                }

            url = os.path.join(
                task.input_artifacts_url,
                'img/{file_name}/'.format(file_name=files[0].name))

            with tempfile.NamedTemporaryFile() as tmpfile:
                tmpfile.name = '{}_tiles_meta.json'.format(files[0].name)
                with open(tmpfile.name, 'w') as json_file:
                    json.dump(meta_data, json_file, indent=4)
                gsutilCopy(tmpfile.name,
                           "{url}{file}".format(url=url, file=tmpfile.name))

            for urls in list_chunks(image_tile_urls, 500):
                gsutilCopy(' '.join(urls), url, recursive=False)

    task.save()
