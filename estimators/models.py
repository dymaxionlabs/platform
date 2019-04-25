import uuid

import rasterio
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.translation import gettext as _

from projects.models import File, Project


class Estimator(models.Model):
    OBJECT_DETECTION = 'OD'
    CLASSIFICATION = 'C'
    TYPE_CHOICES = ((OBJECT_DETECTION, _('Object detection')),
                    # (CLASSIFICATION, _('Classification')),
                    )

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project,
                                null=True,
                                on_delete=models.CASCADE,
                                verbose_name=_('project'))

    estimator_type = models.CharField(_('estimator type'),
                                      max_length=2,
                                      choices=TYPE_CHOICES,
                                      default=OBJECT_DETECTION)
    name = models.CharField(_('name'), max_length=255)
    classes = ArrayField(models.CharField(max_length=32), default=list)
    metadata = JSONField(null=True, blank=True)
    image_files = models.ManyToManyField(File,
                                         related_name='files',
                                         blank=True)

    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        unique_together = (('project', 'estimator_type', 'name'), )

    def __str__(self):
        return '{name} ({type})'.format(name=self.name,
                                        type=self.estimator_type)


def tile_images_path(instance, filename):
    file = instance.file
    return 'user_{user_id}/{filename}/tiles/{id}'.format(
        user_id=file.owner.id, filename=file.filename, id=instance.id)


class ImageTile(models.Model):
    file = models.ForeignKey(File,
                             on_delete=models.CASCADE,
                             verbose_name=_('file'))
    col_off = models.IntegerField(default=0)
    row_off = models.IntegerField(default=0)
    width = models.IntegerField(default=0)
    height = models.IntegerField(default=0)
    tile_file = models.FileField(upload_to=tile_images_path,
                                 verbose_name=_('image'))

    class Meta:
        unique_together = (('file', 'col_off', 'row_off', 'width', 'height'))

    def __str__(self):
        return '{file} ({col_off}, {row_off}, {width}, {height})'.format(
            file=self.file,
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
    image_tile = models.OneToOneField(ImageTile,
                                      on_delete=models.CASCADE,
                                      verbose_name=_('image tile'))
    segments = JSONField(null=True, blank=True, verbose_name=_('segments'))

    def __str__(self):
        return 'Annotation for {image_tile} with {segments} segments'.format(
            image_tile=self.image_tile, segments=len(self.segments))
