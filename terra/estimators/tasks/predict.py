import json
import os
import tempfile

import rasterio
from django.conf import settings
from django_rq import job

from common.utils import gsutilCopy, list_chunks
from estimators.models import Estimator, ImageTile
from storage.client import Client
from tasks.models import Task

from . import run_cloudml


@job("default")
def start_prediction_job(task_id, args, kwargs):
    task = Task.objects.get(pk=task_id)
    prepare_artifacts(task)
    run_cloudml(task, './submit_prediction_job.sh')


def prepare_artifacts(task):
    training_task = Task.objects.get(pk=task.internal_metadata['training_job'])
    csv_url = os.path.join(training_task.input_artifacts_url, 'classes.csv')
    gsutilCopy(csv_url, task.input_artifacts_url, recursive=False)

    estimator = Estimator.objects.get(uuid=task.internal_metadata["estimator"])
    gsutilCopy(estimator.model_url, task.input_artifacts_url)

    upload_prediction_image_tiles(task)


def upload_prediction_image_tiles(task):
    client = Client(task.project)
    task.internal_metadata["image_files"] = []
    for path in task.internal_metadata['tiles_folders']:
        image_tiles = ImageTile.objects.filter(project=task.project,
                                               source_tile_path=path)
        if image_tiles.first() is not None:
            source_file = image_tiles.first().source_image_file
            if source_file not in job.internal_metadata["image_files"]:
                task.internal_metadata["image_files"].append(source_file)
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
