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

from .models import Annotation, Estimator, ImageTile, TrainingJob, PredictionJob


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
    job = TrainingJob.objects.get(pk=training_job_pk)

    annotation_csvs = generate_annotations_csv(job)
    classes_csv = generate_classes_csv(job)
    notify('[{}] Annotations generated'.format(training_job_pk),
            annotation_csvs + [classes_csv])

    upload_image_tiles(job)
    notify('[{}] Image tiles generated'.format(training_job_pk))

    run_cloudml(job,'./submit_job.sh')

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
    return round((min(max(coord, 0), 600) / 600) * max_value)


def generate_annotations_csv(job):
    annotations = Annotation.objects.filter(estimator=job.estimator)

    rows = []
    for annotation in annotations:
        tile = annotation.image_tile
        w, h = tile.width, tile.height
        for s in annotation.segments:
            row = {}
            x1, x2 = sorted([s['x'], s['x'] + s['width']])
            y1, y2 = sorted([s['y'], s['y'] + s['height']])
            analytics_tile_size = 600
            row['x1'] = constrain_and_scale(x1, w)
            row['x2'] = constrain_and_scale(x2, w)
            row['y1'] = constrain_and_scale(y1, h)
            row['y2'] = constrain_and_scale(y2, h)
            row['tile_path'] = 'img/{basename}'.format(
                basename=os.path.basename(tile.tile_file.name))
            row['label'] = s['label']
            rows.append(row)

    rows_train, rows_val = train_val_split_rows(rows)

    urls = []
    for name, rows in zip(['train', 'val'], [rows_train, rows_val]):
        url = os.path.join(job.artifacts_url, '{}.csv'.format(name))
        upload_csv(url, rows, ('tile_path', 'x1', 'y1', 'x2', 'y2', 'label'))
        urls.append(url)

    return urls


def generate_classes_csv(job):
    estimator = job.estimator
    rows = [dict(label=label, class_id=i) for i, label in enumerate(estimator.classes)]
    url = os.path.join(job.artifacts_url, 'classes.csv')
    upload_csv(url, rows, ('label', 'class_id'))


def upload_csv(url, rows, fieldnames):
    with tempfile.NamedTemporaryFile() as tmpfile:
        with open(tmpfile.name, 'w') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            for row in rows:
                writer.writerow(row)
        run_subprocess('gsutil -m cp -r {src} {dst}'.format(src=tmpfile.name,
                                                            dst=url))


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)

def upload_image_tiles(job):
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

def upload_prediction_image_tiles(job):
    for file in job.image_files.all():
        image_tiles = ImageTile.objects.filter(file=file)

        image_tile_urls = [
            'gs://{bucket}/{name}'.format(bucket=settings.GS_BUCKET_NAME,
                                        name=t.tile_file.name)
            for t in image_tiles
        ]

        url = os.path.join(
            job.artifacts_url,
            'img/{file_name}/'.format(file_name=file.name)
        )
        run_subprocess('gsutil -m cp -r {src} {dst}'.format(
            src=' '.join(image_tile_urls), dst=url))

def run_cloudml(job, script_name):
    p = subprocess.Popen(
        [script_name, 
            str(job.estimator.uuid), 
            str(job.pk), 
            'gs://{}'.format(settings.ESTIMATORS_BUCKET),
            settings.CLOUDML_REGION
        ], 
        cwd=settings.CLOUDML_DIRECTORY,
        shell=True
    )


def prepare_artifacts(job):
    training_job = TrainingJob.objects.filter(estimator=job.estimator).first()
    csv_url = os.path.join(training_job.artifacts_url, 'classes.csv')
    run_subprocess('gsutil -m cp {src} {dst}'.format(
        src=csv_url, dst=job.artifacts_url))

    snapshots_path = os.path.join(training_job.artifacts_url, 'snapshots')
    run_subprocess('gsutil -m cp -r {src} {dst}'.format(
        src=snapshots_path, dst=job.artifacts_url))


@job("default")
def start_prediction_job(prediction_job_pk):
    notify('[{}] Prediction job started'.format(prediction_job_pk))
    job = PredictionJob.objects.get(pk=prediction_job_pk)

    prepare_artifacts(job)
    notify('[{}] Artifacts prepared'.format(prediction_job_pk))

    upload_image_tiles(job)
    notify('[{}] Image tiles generated'.format(prediction_job_pk))

    run_cloudml(job, './submit_prediction_job.sh')


@job("default", timeout=3600)
def generate_vector_tiles(file_pk):
    file = File.objects.get(pk=file_pk)

    with tempfile.NamedTemporaryFile() as tmpfile:
        shutil.copyfileobj(file.file, tmpfile)
        src = tmpfile.name

        with tempfile.TemporaryDirectory() as tmpdir:
            # Convert to standar prediction
            output_file = "{dir}{sep}output.json".format(dir=tmpdir, sep=os.path.sep)
            run_subprocess('ogr2ogr -f "GeoJSON" -t_srs epsg:4326 {output_file} {input_file}'.format(
                            output_file=output_file, input_file=src))
            
            # Generate vector tiles
            tiles_output_dir = "{}".format(os.path.sep.join([tmpdir,'tiles',file.name]))
            os.makedirs(tiles_output_dir)
            cmd = "tippecanoe --no-feature-limit --no-tile-size-limit --name='foo' --minimum-zoom=4 --maximum-zoom=18 --output-to-directory {output_dir} {input_file}".format(
                output_dir=tiles_output_dir, input_file=output_file)
            run_subprocess(cmd)

            # Upload to corresponding bucket folder
            """
            gsutil -m -h "Content-Type: application/octet-stream" -h "Content-Encoding: gzip" cp -a public-read -r $LAYER_TILES_DIR/* $GS_URL
            gsutil -m -h "Content-Type: application/json" cp -a public-read -r $LAYER_TILES_DIR/metadata.json $GS_URL
            """
            dst = 'gs://{bucket}/user_{user_id}/tiles/{name}'.format(
                bucket=settings.GS_BUCKET_NAME, user_id=file.owner.pk, name=file.name)
            #run_subprocess('gsutil -m cp -r {src} {dst}'.format(src=tiles_output_dir, dst=dst))
            run_subprocess('gsutil -m -h "Content-Type: application/octet-stream" -h "Content-Encoding: gzip" cp -a public-read -r {src} {dst}'.format(
                src=tiles_output_dir, dst=dst))
            run_subprocess('gsutil -m -h "Content-Type: application/json" cp -a public-read -r {src}/metadata.json {dst}'.format(
                src=tiles_output_dir, dst=dst))
