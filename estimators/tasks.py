import csv
import os
import random
import shutil
import subprocess
import tempfile

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
from terra.emails import notify

from .models import Annotation, Estimator, ImageTile, TrainingJob


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

            size = (1000, 1000)
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
def start_training_job(training_job_pk):
    notify('[{}] Training job started'.format(training_job_pk))
    training_job = TrainingJob.objects.get(pk=training_job_pk)

    csvs = generate_annotation_csv(training_job)
    notify('[{}] Annotations generated'.format(training_job_pk), csvs)

    upload_image_tiles_artifacts(training_job)
    notify('[{}] Image tiles generated'.format(training_job_pk))


def train_val_split_rows(rows, val_size=0.2):
    # FIXME Consider splitting in a stratified manner...
    # Class balancing?
    random.shuffle(rows)
    n_val_size = round(len(rows) * val_size)
    return rows[n_val_size:], rows[:n_val_size]


def generate_annotation_csv(job):
    annotations = Annotation.objects.filter(estimator=job.estimator)

    rows = []
    for annotation in annotations:
        tile = annotation.image_tile
        w, h = tile.width, tile.height
        for s in annotation.segments:
            row = {}
            x1, x2 = sorted([s['x'], s['x'] + s['width']])
            y1, y2 = sorted([s['y'], s['y'] + s['height']])
            row['x1'] = min(max(x1, 0), w)
            row['x2'] = min(max(x2, 0), w)
            row['y1'] = min(max(y1, 0), h)
            row['y2'] = min(max(y2, 0), h)
            row['tile_path'] = 'img/{basename}'.format(
                basename=os.path.basename(tile.tile_file.name))
            row['label'] = s['label']
            rows.append(row)

    rows_train, rows_val = train_val_split_rows(rows)

    urls = []
    for name, rows in zip(['train', 'val'], [rows_train, rows_val]):
        url = os.path.join(job.artifacts_url, '{}.csv'.format(name))
        upload_csv(url, rows)
        urls.append(url)

    return urls


def upload_csv(url, rows):
    with tempfile.NamedTemporaryFile() as tmpfile:
        with open(tmpfile.name, 'w') as csvfile:
            # format: path/to/image.jpg,x1,y1,x2,y2,class_name
            fieldnames = ['tile_path', 'x1', 'y1', 'x2', 'y2', 'label']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            for row in rows:
                writer.writerow(row)
        run_subprocess('gsutil -m cp -r {src} {dst}'.format(src=tmpfile.name,
                                                            dst=url))


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def upload_image_tiles_artifacts(job):
    annotations = Annotation.objects.filter(estimator=job.estimator).all()
    image_tiles = [a.image_tile for a in annotations]

    image_tile_urls = [
        'gs://{bucket}/{name}'.format(bucket=settings.GS_BUCKET_NAME,
                                      name=t.tile_file.name)
        for t in image_tiles
    ]

    url = os.path.join(job.artifacts_url, 'img/')
    run_subprocess('gsutil -m cp -r {src} {dst}'.format(
        src=' '.join(image_tile_urls), dst=url))
