import os
import shutil
import subprocess
import tempfile
import time

import rasterio
from celery import Task, chain, states
from shapely.geometry import box

from projects.models import File, Layer
from terra import settings
from terra.celery import app


class ChainedTask(Task):
    abstract = True

    def __call__(self, *args, **kwargs):
        if len(args) == 1 and isinstance(args[0], dict):
            kwargs.update(args[0])
            args = ()
        return super(ChainedTask, self).__call__(*args, **kwargs)


def update_progress(task, step, total, **meta):
    meta.update({'current': step, 'total': total})
    print("Meta:", meta)
    task.update_state(state='PROGRESS', meta=meta)


def get_raster_extent_polygon(raster):
    with rasterio.open(raster) as src:
        return box(*src.bounds)


def upload_directory_to_gs_bucket(src, dst):
    cmd = 'gsutil -m cp -r {src} {dst}'.format(src=src, dst=dst)
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


@app.task(bind=True)
def test_sleep(self, foo=1, bar=2):
    n = 60
    for i in range(0, n):
        if not self.request.called_directly:
            update_progress(self, i, n)
        time.sleep(1)
        print("Sleeping ({})".format(i))


@app.task(bind=True)
def test_fail(self):
    raise RuntimeError("oops")


@app.task(base=ChainedTask, bind=True)
def generate_raster_tiles(self, file_pk):
    update_progress(self, 1, 3, file_pk=file_pk)

    file = File.objects.get(pk=file_pk)

    # First, download file from storage to temporary local file
    with tempfile.NamedTemporaryFile() as tmpfile:
        shutil.copyfileobj(file.file, tmpfile)
        src = tmpfile.name

        area_geom = get_raster_extent_polygon(src)

        update_progress(self, 2, 3, file_pk=file_pk)

        # For now, we are going to generate tiles for a specific zoom range
        zoom_range = '4-18'

        # Create destination directory
        temp_name = next(tempfile._get_candidate_names())
        tiles_dir = os.path.join(os.path.join(settings.TILES_DIR), temp_name)
        os.makedirs(tiles_dir)
        dst = tiles_dir

        # Use gdal2tiles.py to generate raster tiles
        cmd = 'gdal2tiles.py -e -w none -n -z {zoom_range} {src} {dst}'.format(
            zoom_range=zoom_range,
            src=src,
            dst=dst,
        )
        print(cmd)
        subprocess.run(cmd, shell=True, check=True)

    update_progress(self, 3, 3, file_pk=file_pk)

    return dict(tiles_path=tiles_dir, area_geom=area_geom)


@app.task(base=ChainedTask, bind=True)
def create_raster_layer(self, file_pk, tiles_dir, area_geom):
    update_progress(self, 0, 100, file_pk=file_pk, tiles=tiles_dir)

    file = File.objects.get(pk=file_pk)

    layer = Layer.objects.create(
        name=file.name,
        project=file.project,
        layer_type=Layer.RASTER,
        area_geom=area_geom,
        file=file,
    )

    # Upload tiles to corresponding Tiles bucket
    upload_directory_to_gs_bucket(tiles_dir, layer.tiles_bucket_url)

    return dict(layer_pk=layer.pk)


def process_raster_file(file):
    pipe = chain(
        generate_raster_tiles.s(file_pk=file.pk)
        | create_raster_layer.s(file_pk=file.pk))
    return pipe.apply_async()


#def test_generate_raster_tiles():
#    from projects.models import File
#    from projects import tasks
#    file = File.objects.last()
#    tasks.generate_raster_tiles.delay(file.pk)
