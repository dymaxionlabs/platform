import csv
import json
import os
import random
import shutil
import subprocess
import tempfile
from itertools import groupby
from operator import itemgetter

import numpy as np
import rasterio
from django.conf import settings
from django.core.files import File as DjangoFile
from django.core.mail import send_mail
from django_rq import job
from rasterio.windows import Window
from skimage import exposure
from skimage.io import imsave

from projects.models import File

from .models import Annotation, Estimator, ImageTile, TrainingJob, PredictionJob
from tasks.models import Task
IMAGE_TILE_SIZE = 500


@job("default", timeout=3600)
def generate_image_tiles(file_pk):
    file = File.objects.get(pk=file_pk)

    # First, download file from storage to temporary local file
    with tempfile.NamedTemporaryFile() as tmpfile:
        shutil.copyfileobj(file.file, tmpfile)
        src = tmpfile.name

        with rasterio.open(src) as ds:
            print('Raster size:', (ds.width, ds.height))

            if ds.count < 3:
                raise RuntimeError(
                    "Raster must have 3 bands corresponding to RGB channels")

            if ds.count > 3:
                print("WARNING: Raster has {} bands. " \
                    "Going to assume first 3 bands are RGB...".format(ds.count))

            size = (IMAGE_TILE_SIZE, IMAGE_TILE_SIZE)
            windows = list(sliding_windows(size, size, ds.width, ds.height))

            with tempfile.TemporaryDirectory() as tmpdir:
                for window, (i, j) in windows:
                    print(window, (i, j))
                    img = ds.read(window=window)
                    img = img[:3, :, :]

                    img_fname = '{i}_{j}.jpg'.format(i=i, j=j)
                    img_path = os.path.join(tmpdir, img_fname)
                    was_image_written = write_image(img, img_path)

                    if was_image_written:
                        tile, _ = ImageTile.objects.get_or_create(
                            file=file,
                            col_off=window.col_off,
                            row_off=window.row_off,
                            width=window.width,
                            height=window.height)
                        with open(img_path, 'rb') as f:
                            tile.tile_file = DjangoFile(f, name=img_fname)
                            tile.save()


def sliding_windows(size, step_size, width, height):
    """Slide a window of +size+ by moving it +step_size+ pixels"""
    w, h = size
    sw, sh = step_size
    for pos_i, i in enumerate(range(0, height - h + 1, sh)):
        for pos_j, j in enumerate(range(0, width - w + 1, sw)):
            yield Window(j, i, w, h), (pos_i, pos_j)


def write_image(img, path):
    rgb = np.dstack(img[:3, :, :])
    if exposure.is_low_contrast(rgb):
        return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    imsave(path, rgb)
    return True


@job("default")
def start_training_job(task_id):
    job = Task.objects.get(pk=task_id)
    annotation_csvs = generate_annotations_csv(job)
    classes_csv = generate_classes_csv(job)
    upload_image_tiles(job)
    run_cloudml(job, './submit_job.sh')


def train_val_split_rows(rows, val_size=0.2):
    # FIXME Consider splitting in a stratified manner...
    # Class balancing?
    random.shuffle(rows)
    n_val_size = round(len(rows) * val_size)
    return rows[n_val_size:], rows[:n_val_size]


def constrain_and_scale(coord, max_value):
    # FIXME !! When Analytics starts saving annotations with scaled coordinates
    # (from 0 to 1), replace with:
    # return round(min(max(coord, 0), 1) * max_value)
    # if coord < 0 or coord > IMAGE_TILE_SIZE:
    #     import pdb
    #     pdb.set_trace()
    #     pass
    return round(
        (min(max(coord, 0), IMAGE_TILE_SIZE) / IMAGE_TILE_SIZE) * max_value)


def build_annotations_csv_rows(annotations):
    rows = []
    for annotation in annotations:
        tile = annotation.image_tile
        w, h = tile.width, tile.height
        for s in annotation.segments:
            print(annotation, s)
            row = {}
            x1, x2 = sorted([s['x'], s['x'] + s['width']])
            y1, y2 = sorted([s['y'], s['y'] + s['height']])
            row['x1'] = constrain_and_scale(x1, w)
            row['x2'] = constrain_and_scale(x2, w)
            row['y1'] = constrain_and_scale(y1, h)
            row['y2'] = constrain_and_scale(y2, h)
            row['tile_path'] = 'img/{basename}'.format(
                basename=os.path.join(tile.file.name, os.path.basename(tile.tile_file.name)))
            row['label'] = s['label']
            rows.append(row)
    return rows


def generate_annotations_csv(job):
    annotations = Annotation.objects.filter(
        estimator__uuid=job.internal_metadata["estimator"])

    rows = build_annotations_csv_rows(annotations)

    rows_train, rows_val = train_val_split_rows(rows)

    urls = []
    for name, rows in zip(['train', 'val'], [rows_train, rows_val]):
        url = os.path.join(job.artifacts_url, '{}.csv'.format(name))
        upload_csv(url, rows, ('tile_path', 'x1', 'y1', 'x2', 'y2', 'label'))
        urls.append(url)

    return urls


def generate_classes_csv(job):
    estimator = Estimator.objects.get(uuid=job.internal_metadata["estimator"])
    rows = [
        dict(label=label, class_id=i)
        for i, label in enumerate(estimator.classes)
    ]
    url = os.path.join(job.artifacts_url, 'classes.csv')
    upload_csv(url, rows, ('label', 'class_id'))


def upload_csv(url, rows, fieldnames):
    with tempfile.NamedTemporaryFile() as tmpfile:
        with open(tmpfile.name, 'w') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            for row in rows:
                writer.writerow(row)
        run_subprocess('{sdk_bin_path}/gsutil -m cp -r {src} {dst}'.format(
            sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
            src=tmpfile.name,
            dst=url))


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def upload_image_tiles(job):
    annotations = Annotation.objects.filter(
        estimator__uuid=job.internal_metadata["estimator"]).all()
    image_tiles = [a.image_tile for a in annotations]

    image_tile_urls = [
        'gs://{bucket}/{name}'.format(bucket=settings.GS_BUCKET_NAME,
                                      name=t.tile_file.name)
        for t in image_tiles
    ]
    image_file_names = [
        os.path.dirname(t.tile_file.name).split("/")[-1]
        for t in image_tiles
    ]

    seq = sorted(zip(image_file_names, image_tile_urls), key=itemgetter(0))
    groups = groupby(seq, itemgetter(0))

    for img_file_name, urls in groups:
        urls = [url for _, url in urls]
        dst_url = os.path.join(job.artifacts_url, 'img/', img_file_name)
        run_subprocess('{sdk_bin_path}/gsutil -m cp -r {src} {dst}'.format(
            sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
            src=' '.join(urls),
            dst=dst_url))


def upload_prediction_image_tiles(job):
    for file in job.image_files.all():
        image_tiles = ImageTile.objects.filter(file=file)

        image_tile_urls = []
        meta_data = {}
        if file.metadata:
            meta_data['tiff_data'] = json.loads(file.metadata)
        for t in image_tiles:
            image_tile_urls.append('gs://{bucket}/{name}'.format(
                bucket=settings.GS_BUCKET_NAME, name=t.tile_file.name))
            meta_data[os.path.basename(t.tile_file.name)] = {
                'col_off': t.col_off,
                'row_off': t.row_off,
                'width': t.width,
                'height': t.height,
            }

        url = os.path.join(job.artifacts_url,
                           'img/{file_name}/'.format(file_name=file.name))

        with tempfile.NamedTemporaryFile() as tmpfile:
            tmpfile.name = '{}_tiles_meta.json'.format(file.name)
            with open(tmpfile.name, 'w') as json_file:
                json.dump(meta_data, json_file, indent=4)
            run_subprocess('{sdk_bin_path}/gsutil -m cp -r {src} {dst}'.format(
                sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
                src=tmpfile.name,
                dst="{url}{file}".format(url=url, file=tmpfile.name)))

        run_subprocess('{sdk_bin_path}/gsutil -m cp -r {src} {dst}'.format(
            sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
            src=' '.join(image_tile_urls),
            dst=url))


def run_cloudml(job, script_name):
    epochs = settings.CLOUDML_DEAULT_EPOCHS
    if job.estimator.configuration is not None:
        if 'training_hours' in job.estimator.configuration:
            epochs = job.estimator.configuration['training_hours'] * 6

    p = subprocess.Popen(
        [script_name],
        env={
            'CLOUDSDK_PYTHON':
            '/usr/bin/python3',
            'PATH':
            '{sdk_bin_path}/:{path}'.format(
                sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
                path=os.getenv('PATH')),
            'TERRA_ESTIMATOR_UUID':
            str(job.internal_metadata["estimator"]),
            'TERRA_JOB_ID':
            str(job.pk),
            'JOB_DIR':
            job.job_dir,
            'REGION':
            settings.CLOUDML_REGION,
            'PROJECT':
            settings.CLOUDML_PROJECT,
            'ESTIMATORS_BUCKET':
            'gs://{}'.format(settings.ESTIMATORS_BUCKET),
            'PUBSUB_TOPIC':
            settings.PUBSUB_JOB_TOPIC_ID,
            'SENTRY_SDK':
            os.environ['SENTRY_DNS'],
            'SENTRY_ENVIRONMENT':
            os.environ['SENTRY_ENVIRONMENT'],
            'EPOCHS':
            str(round(epochs)),
        },
        cwd=settings.CLOUDML_DIRECTORY,
        shell=True)


def prepare_artifacts(job):
    training_job = TrainingJob.objects.get(pk=job.metadata['training_job'])
    csv_url = os.path.join(training_job.artifacts_url, 'classes.csv')
    run_subprocess('{sdk_bin_path}/gsutil -m cp {src} {dst}classes.csv'.format(
        sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
        src=csv_url,
        dst=job.artifacts_url))

    snapshots_path = os.path.join(training_job.artifacts_url, 'snapshots')
    run_subprocess('{sdk_bin_path}/gsutil -m cp -r {src} {dst}'.format(
        sdk_bin_path=settings.GOOGLE_SDK_BIN_PATH,
        src=snapshots_path,
        dst=job.artifacts_url))


@job("default")
def start_prediction_job(prediction_job_pk):
    job = PredictionJob.objects.get(pk=prediction_job_pk)

    prepare_artifacts(job)

    upload_prediction_image_tiles(job)

    run_cloudml(job, './submit_prediction_job.sh')
