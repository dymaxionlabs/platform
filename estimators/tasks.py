import os
import shutil
import tempfile

import numpy as np
import rasterio
from django.core.files import File as DjangoFile
from django_rq import job
from rasterio.windows import Window
from skimage import exposure
from skimage.io import imsave

from projects.models import File

from .models import ImageTile


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
