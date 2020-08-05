import csv
import os
import random
import tempfile
from itertools import groupby
from operator import itemgetter

from django.conf import settings
from django_rq import job
from datetime import datetime

from terra.utils import gsutilCopy
from estimators.models import Annotation, Estimator, ImageTile
from tasks.models import Task

from . import run_cloudml


@job("default")
def start_training_job(task_id):
    task = Task.objects.get(pk=task_id)
    prepare_artifacts(task)
    job_name = f'train_{task_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    task.internal_metadata.update(uses_cloudml=True)
    run_cloudml(task, './submit_job.sh', job_name)
    task.internal_metadata.update(cloudml_job_name=job_name)
    task.save(update_fields=["internal_metadata"])


def prepare_artifacts(task):
    generate_annotations_csv(task)
    generate_classes_csv(task)
    upload_image_tiles(task)


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
    return round(min(max(coord, 0), max_value))


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
            row['tile_path'] = 'img/{basename}'.format(basename=os.path.join(
                os.path.basename(os.path.normpath(tile.source_tile_path)),
                os.path.basename(tile.tile_file.name)))
            row['label'] = s['label']
            rows.append(row)
    return rows


def generate_annotations_csv(task):
    annotations = Annotation.objects.filter(
        estimator__uuid=task.kwargs["estimator"])

    rows = build_annotations_csv_rows(annotations)

    rows_train, rows_val = train_val_split_rows(rows)

    urls = []
    for name, rows in zip(['train', 'val'], [rows_train, rows_val]):
        url = os.path.join(task.input_artifacts_url, '{}.csv'.format(name))
        upload_csv(url, rows, ('tile_path', 'x1', 'y1', 'x2', 'y2', 'label'))
        urls.append(url)

    return urls


def generate_classes_csv(job):
    estimator = Estimator.objects.get(uuid=job.kwargs["estimator"])
    rows = [
        dict(label=label, class_id=i)
        for i, label in enumerate(estimator.classes)
    ]
    url = os.path.join(job.input_artifacts_url, 'classes.csv')
    upload_csv(url, rows, ('label', 'class_id'))


def upload_csv(url, rows, fieldnames):
    with tempfile.NamedTemporaryFile() as tmpfile:
        with open(tmpfile.name, 'w') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            for row in rows:
                writer.writerow(row)
        gsutilCopy(tmpfile.name, url)


def upload_image_tiles(job):
    annotations = Annotation.objects.filter(
        estimator__uuid=job.kwargs["estimator"]).all()
    image_tiles = [a.image_tile for a in annotations]

    image_tile_urls = [
        'gs://{bucket}/{name}'.format(bucket=settings.GS_BUCKET_NAME,
                                      name=t.tile_file.name)
        for t in image_tiles
    ]
    image_file_names = [
        os.path.dirname(t.tile_file.name).split("/")[-1] for t in image_tiles
    ]

    seq = sorted(zip(image_file_names, image_tile_urls), key=itemgetter(0))
    groups = groupby(seq, itemgetter(0))

    for img_file_name, urls in groups:
        urls = [url for _, url in urls]
        dst_url = os.path.join(job.input_artifacts_url, 'img/', img_file_name)
        gsutilCopy(' '.join(urls), dst_url)
