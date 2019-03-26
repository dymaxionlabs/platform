import os
import shutil
import subprocess
import tempfile
import time

from celery import states

from projects.models import File
from terra import settings
from terra.celery import app


@app.task(bind=True)
def test_sleep(self, foo=1, bar=2):
    n = 60
    for i in range(0, n):
        if not self.request.called_directly:
            self.update_state(
                state='PROGRESS', meta={
                    'current': i,
                    'total': n
                })
        time.sleep(1)
        print("Sleeping ({})".format(i))


@app.task(bind=True)
def test_fail(self):
    raise RuntimeError("oops")


@app.task(bind=True)
def generate_raster_tiles(self, file_pk):
    file = File.objects.get(pk=file_pk)

    # First, download file from storage to temporary local file
    with tempfile.NamedTemporaryFile() as tmpfile:
        shutil.copyfileobj(file.file, tmpfile)
        src = tmpfile.name

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

    return dict(tiles_path=tiles_dir)


#def test_generate_raster_tiles():
#    from projects.models import File
#    from projects import tasks
#    file = File.objects.last()
#    tasks.generate_raster_tiles.delay(file.pk)
