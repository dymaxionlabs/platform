import pyproj
import rasterio
import tempfile
from datetime import datetime
from django_rq import job
from functools import partial
from rasterio.windows import Window
from shapely.geometry import box, mapping, shape
from estimators.models import Estimator, ImageTile, Annotation
from estimators.utils import get_raster_metadata
from storage.client import GCSClient
from storage.models import File
from tasks.models import Task, TaskLogEntry

# Import fiona last
import fiona

def process_hits(hits, *, window_bounds, index, transform, label, label_property, estimator, transform_project):
    window_box = box(*window_bounds)

    segments = []
    for hit in hits:
        # Generate a bounding box from the original geometry
        if label is None:
            if 'properties' in hit and label_property in hit['properties']:
                label = hit['properties'][label_property]
        if label is None or label == '':
            continue
        hit_shape = shape(hit['geometry'])
        if transform_project:
            hit_shape = transform(transform_project, hit_shape)
        if estimator.estimator_type == 'OD':
            bbox = box(*hit_shape.bounds)
            inter_bbox = window_box.intersection(bbox)
            inter_bbox_bounds = inter_bbox.bounds
            minx, maxy = ~transform * (inter_bbox_bounds[0],
                                    inter_bbox_bounds[1])
            maxx, miny = ~transform * (inter_bbox_bounds[2],
                                    inter_bbox_bounds[3])
            segment = dict(x=minx - index[0],
                        y=miny - index[1],
                        width=round(maxx - minx),
                        height=round(maxy - miny),
                        label=label)

            if segment['width'] > 0 and segment['height'] > 0:
                segments.append(segment)
        elif estimator.estimator_type == 'SG':
            segment = dict(geom=mapping(hit_shape), label=label)
            segments.append(segment)

        estimator.add_class(label)

    return segments

@job("default", timeout=3600)
def import_from_vector_file(task_id):
    job = Task.objects.get(pk=task_id)
    try:
        client = GCSClient(job.project)
        estimator = Estimator.objects.get(uuid=job.kwargs["estimator"])

        image_file = File.objects.filter(project=job.project, path=job.kwargs['image_file'], complete=True).first()
        crs, transform = get_raster_metadata(image_file)

        res = []
        vector_files = list(client.list_files(job.kwargs['vector_file']))
        with tempfile.NamedTemporaryFile() as tmpfile:
            src = tmpfile.name
            vector_files[0].download_to_filename(src)

            with fiona.open(src, "r") as dataset:
                partial_func = partial(pyproj.transform, pyproj.Proj(dataset.crs['init']), pyproj.Proj(crs))
                transform_project = None if dataset.crs['init'] == crs else None

                for tile in ImageTile.objects.filter(
                        project=job.project, source_image_file=image_file.path):
                    print("Tile: {}".format(tile))
                    win = Window(tile.col_off, tile.row_off, tile.width,
                                 tile.height)
                    win_bounds = rasterio.windows.bounds(win, transform)
                    hits = [
                        hit for _, hit in dataset.items(bbox=(win_bounds[0],
                                                              win_bounds[1],
                                                              win_bounds[2],
                                                              win_bounds[3]))
                    ]
                    segments = process_hits(hits,
                                            window_bounds=win_bounds,
                                            index=(tile.col_off,
                                                tile.row_off),
                                            transform=transform,
                                            label=job.kwargs['label'],
                                            label_property=job.kwargs['label_property'],
                                            estimator=estimator,
                                            transform_project=transform_project)
                    if len(segments) > 0:
                        annotation, created = Annotation.objects.get_or_create(estimator=estimator, 
                                                                                image_tile=tile)
                        if created:
                            annotation.segments = segments
                        else:
                            annotation.segments = annotation.segments + segments
                        annotation.save()
                    print("{} segments created.".format(len(segments)))
    except Exception as err:
        err_msg = str(err)
        TaskLogEntry.objects.create(task=job,
                                    log=dict(error=err_msg),
                                    logged_at=datetime.now())
        print(f"Error: {err_msg}")
        job.mark_as_failed(reason=err_msg)
    else:
        job.mark_as_finished()