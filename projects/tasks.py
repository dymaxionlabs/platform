import json
import os
import shutil
import subprocess
import tempfile
import time
from functools import partial

import django_rq
import pyproj
import rasterio
from django.contrib.gis.geos import GEOSGeometry
from django_rq import job
from rq import get_current_job
from shapely.geometry import box, mapping
from shapely.ops import transform

from terra import settings

from .models import File, Layer

GDAL2TILES_PATH = os.path.join(settings.SCRIPT_DIR, 'preprocess',
                               'gdal2tilesp.py')
EPSG_4326 = dict(init='epsg:4326')


def update_progress(step, total, **meta):
    job = get_current_job()
    if 'progress' not in job.meta:
        job.meta['progress'] = {}
    progress = job.meta['progress']
    progress['current'] = step
    progress['total'] = total
    job.meta.update(meta)
    job.save_meta()
    print("Update state:", {'current': step, 'total': total})


def get_raster_extent_polygon(raster):
    with rasterio.open(raster) as src:
        s = box(*src.bounds)
        s = reproject_shape(s, src.crs, EPSG_4326)
        return s


def reproject_shape(shape, src_crs, dst_crs):
    """Reprojects a shape from some projection to another"""
    project = partial(pyproj.transform, pyproj.Proj(init=src_crs['init']),
                      pyproj.Proj(init=dst_crs['init']))
    return transform(project, shape)


def run_subprocess(cmd):
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)


def upload_directory_to_gs_bucket(src, dst):
    run_subprocess('gsutil -m cp -r {src} {dst}'.format(src=src, dst=dst))
    run_subprocess('gsutil -m cp -a public-read -r {src}/* {dst}'.format(
        src=src, dst=dst))


@job
def test_sleep(foo=1, bar=2):
    n = 60
    for i in range(0, n):
        update_progress(i, n)
        time.sleep(1)
        print("Sleeping ({})".format(i))


@job
def test_fail():
    raise RuntimeError("oops")


@job
def generate_raster_tiles(file_pk):
    update_progress(1, 3, file_pk=file_pk)

    file = File.objects.get(pk=file_pk)

    # First, download file from storage to temporary local file
    with tempfile.NamedTemporaryFile() as tmpfile:
        shutil.copyfileobj(file.file, tmpfile)
        src = tmpfile.name

        area_geom = mapping(get_raster_extent_polygon(src))

        update_progress(2, 3, file_pk=file_pk)

        # For now, we are going to generate tiles for a specific zoom range
        zoom_range = '4-18'

        # Create destination directory
        temp_name = next(tempfile._get_candidate_names())
        tiles_dir = os.path.join(os.path.join(settings.TILES_DIR), temp_name)
        os.makedirs(tiles_dir)
        dst = tiles_dir

        # Use gdal2tiles.py to generate raster tiles
        cmd = '{gdal2tiles} -e -w none -n -z {zoom_range} {src} {dst}'.format(
            gdal2tiles=GDAL2TILES_PATH,
            zoom_range=zoom_range,
            src=src,
            dst=dst,
        )
        print(cmd)
        subprocess.run(cmd, shell=True, check=True)

    update_progress(3, 3, file_pk=file_pk)

    django_rq.enqueue(create_raster_layer, file_pk, tiles_dir, area_geom)

    return dict(tiles_path=tiles_dir, area_geom=area_geom)


@job
def create_raster_layer(file_pk, tiles_dir, area_geom):
    update_progress(0, 100, file_pk=file_pk, tiles=tiles_dir)

    file = File.objects.get(pk=file_pk)

    area_geos_geometry = GEOSGeometry(json.dumps(area_geom))

    try:
        layer = Layer.objects.get(name=file.name, project=file.project)
    except Layer.DoesNotExist:
        layer = Layer(name=file.name, project=file.project)
    layer.layer_type = Layer.RASTER
    layer.area_geom = area_geos_geometry
    layer.file = file
    layer.save()

    # Upload tiles to corresponding Tiles bucket
    upload_directory_to_gs_bucket(tiles_dir, layer.tiles_bucket_url())

    return dict(layer_pk=layer.pk)


#def test_generate_raster_tiles():
#    from projects.models import File
#    from projects import tasks
#    file = File.objects.last()
#    tasks.generate_raster_tiles.delay(file.pk)
