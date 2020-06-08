import os
import random
import uuid
import tempfile
import shutil

import rasterio
from shapely.geometry import box, shape
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.translation import gettext as _
from rasterio.windows import Window

from projects.models import File, Project
from storage.client import Client

# Import fiona last
import fiona


class Estimator(models.Model):
    TRAINING_JOB_TASK = 'estimators.tasks.start_training_job'
    PREDICTION_JOB_TASK = 'estimators.tasks.start_prediction_job'
    IMAGE_TILING_TASK = 'estimators.tasks.generate_image_tiles'

    OBJECT_DETECTION = 'OD'
    CLASSIFICATION = 'C'
    TYPE_CHOICES = ((OBJECT_DETECTION, _('Object detection')),
                    # (CLASSIFICATION, _('Classification')),
                    )

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project,
                                null=True,
                                on_delete=models.CASCADE,
                                verbose_name=_('project'),
                                related_name=_('estimators'))

    estimator_type = models.CharField(_('estimator type'),
                                      max_length=2,
                                      choices=TYPE_CHOICES,
                                      default=OBJECT_DETECTION)
    name = models.CharField(_('name'), max_length=255)
    classes = ArrayField(models.CharField(max_length=32), default=list)
    configuration = JSONField(null=True, blank=True)
    metadata = JSONField(null=True, blank=True)
    # @deprecated
    _image_files = models.ManyToManyField(File,
                                          related_name='files',
                                          blank=True)
    image_files = ArrayField(models.CharField(max_length=512),
                             default=list,
                             blank=True)

    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        unique_together = (('project', 'estimator_type', 'name'), )

    def __str__(self):
        return '{name} ({type})'.format(name=self.name,
                                        type=self.estimator_type)


def tile_images_path(instance, filename):
    raster_fname = os.path.basename(instance.source_image_file)
    return 'project_{project_id}/tiles/{raster_fname}/{filename}'.format(
        project_id=instance.project.id,
        raster_fname=raster_fname,
        filename=filename)


def get_random_integer_value():
    return random.randint(-2147483648, 2147483647)


class ImageTile(models.Model):
    # @deprecated
    file = models.ForeignKey(File,
                             on_delete=models.CASCADE,
                             verbose_name=_('file'),
                             blank=True,
                             null=True)
    source_image_file = models.CharField(max_length=255,
                                         verbose_name=_('source image path'))
    project = models.ForeignKey(Project,
                                null=True,
                                on_delete=models.CASCADE,
                                verbose_name=_('project'),
                                related_name=_('tiles'))
    col_off = models.IntegerField(default=0)
    row_off = models.IntegerField(default=0)
    width = models.IntegerField(default=0)
    height = models.IntegerField(default=0)
    tile_file = models.FileField(upload_to=tile_images_path,
                                 verbose_name=_('image'))
    index = models.IntegerField(default=get_random_integer_value)

    class Meta:
        unique_together = (('source_image_file', 'col_off', 'row_off', 'width',
                            'height'))
        indexes = [models.Index(fields=['source_image_file', 'index'])]

    def __str__(self):
        return '{file} ({col_off}, {row_off}, {width}, {height})'.format(
            file=self.source_image_file,
            col_off=self.col_off,
            row_off=self.row_off,
            width=self.width,
            height=self.height)

    def window(self):
        """Returns the Window instance of itself"""
        return rasterio.windows.Window(self.col_off, self.row_off, self.width,
                                       self.height)


class Annotation(models.Model):
    estimator = models.ForeignKey(Estimator,
                                  on_delete=models.CASCADE,
                                  verbose_name=_('estimator'))
    image_tile = models.ForeignKey(ImageTile,
                                   on_delete=models.CASCADE,
                                   verbose_name=_('image tile'))
    segments = JSONField(null=True, blank=True, verbose_name=_('segments'))

    class Meta:
        unique_together = (('estimator', 'image_tile'))

    @classmethod
    def import_from_vector_file(cls, project, vector_file, image_file, *,
                                estimator, label):
        if label not in estimator.classes:
            raise ValueError("invalid label for estimator")

        client = Client(project)

        with tempfile.NamedTemporaryFile() as tmpfile:
            src = tmpfile.name
            image_file.download_to_filename(src)
            with rasterio.open(src) as ds:
                if ds.driver == 'GTiff':
                    transform = ds.transform

        res = []
        vector_files = list(client.list_files(vector_file.path))
        with tempfile.NamedTemporaryFile() as tmpfile:
            src = tmpfile.name
            vector_files[0].download_to_filename(src)

            with fiona.open(src, "r") as dataset:
                for tile in ImageTile.objects.filter(
                        project=project, source_image_file=image_file.path):
                    win = Window(tile.col_off, tile.row_off, tile.width,
                                 tile.height)
                    win_bounds = rasterio.windows.bounds(win, transform)
                    hits = [
                        hit for _, hit in dataset.items(bbox=(win_bounds[0],
                                                              win_bounds[1],
                                                              win_bounds[2],
                                                              win_bounds[3]))
                    ]
                    segments = cls._process_hits(hits,
                                                 window_bounds=win_bounds,
                                                 index=(tile.col_off,
                                                        tile.row_off),
                                                 transform=transform,
                                                 label=label)
                    annotation = cls.objects.create(estimator=estimator,
                                                    image_tile=tile,
                                                    segments=segments)
                    res.append(annotation)
        return res

    @classmethod
    def _process_hits(cls, hits, *, window_bounds, index, transform, label):
        window_box = box(*window_bounds)

        segments = []
        for hit in hits:
            # Generate a bounding box from the original geometry
            hit_shape = shape(hit['geometry'])
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
        return segments

    def __str__(self):
        return 'Annotation for {image_tile} with {segments} segments'.format(
            image_tile=self.image_tile, segments=len(self.segments))


# @deprecated
class TrainingJob(models.Model):
    estimator = models.ForeignKey(Estimator,
                                  on_delete=models.CASCADE,
                                  verbose_name=_('estimator'))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    metadata = JSONField(null=True, blank=True)
    finished = models.BooleanField(default=False)

    @property
    def artifacts_url(self):
        return 'gs://{bucket}/{estimator_uuid}/jobs/train/{pk}/artifacts/'.format(
            bucket=settings.ESTIMATORS_BUCKET,
            estimator_uuid=self.estimator.uuid,
            pk=self.pk)


# @deprecated
class PredictionJob(models.Model):
    estimator = models.ForeignKey(Estimator,
                                  on_delete=models.CASCADE,
                                  verbose_name=_('estimator'))
    image_files = models.ManyToManyField(File, blank=True)
    result_files = models.ManyToManyField(File,
                                          blank=True,
                                          related_name='prediction_job')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    metadata = JSONField(null=True, blank=True)
    finished = models.BooleanField(default=False)

    @property
    def artifacts_url(self):
        return 'gs://{bucket}/{estimator_uuid}/jobs/predict/{pk}/artifacts/'.format(
            bucket=settings.ESTIMATORS_BUCKET,
            estimator_uuid=self.estimator.uuid,
            pk=self.pk)

    @property
    def predictions_url(self):
        return 'gs://{bucket}/{estimator_uuid}/jobs/predict/{pk}/predictions/'.format(
            bucket=settings.ESTIMATORS_BUCKET,
            estimator_uuid=self.estimator.uuid,
            pk=self.pk)
