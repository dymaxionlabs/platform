import os
import random
import uuid
import shutil
import rasterio

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.translation import gettext as _
from rasterio.crs import CRS
from rasterio.windows import Window

from estimators.utils import get_raster_metadata
from projects.models import Project
from storage.models import File


class Estimator(models.Model):
    suffix_sep = '__'

    TRAINING_JOB_TASK = 'estimators.tasks.train.start_training_job'
    PREDICTION_JOB_TASK = 'estimators.tasks.predict.start_prediction_job'
    IMAGE_TILING_TASK = 'estimators.tasks.tile.generate_image_tiles'
    ANNOTATION_TASK = 'estimators.tasks.annotation.import_from_vector_file'

    OBJECT_DETECTION = 'OD'
    CLASSIFICATION = 'C'
    SEGMENTATION = 'SG'
    TYPE_CHOICES = ((OBJECT_DETECTION, _('Object detection')),
                    (SEGMENTATION, _('Segmentation'))
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

    @property
    def model_url(self):
        return 'gs://{bucket}/{project_id}/{pk}/latest.h5'.format(
            bucket=settings.MODELS_BUCKET,
            project_id=self.project.pk,
            pk=self.pk)

    @property
    def estimated_training_duration(self):
        if self.estimator_type == "OD":
            ### RetinaNet estimator
            epochs = settings.CLOUDML_DEFAULT_EPOCHS
            steps = settings.CLOUDML_DEFAULT_STEPS
            if self.configuration and 'epochs' in self.configuration:
                epochs = int(self.configuration['epochs'])
            if self.configuration and 'steps' in self.configuration:
                steps = int(self.configuration['steps'])
            # Currently takes around 7 minutes per epoch (1000 steps)
            return epochs * (steps * 7 / 1000) * 60

    @classmethod
    def _last_name_with_suffix(cls, estimator):
        estimators = cls.objects.filter(
            project=estimator.project,
            estimator_type=estimator.estimator_type,
            name__startswith='{name}{sep}'.format(sep=cls.suffix_sep,
                                                  name=estimator.name))
        last_estimator = estimators.last()
        return last_estimator and last_estimator.name

    def add_class(self, label):
        self.classes.append(label)
        self.classes = list(set(self.classes))
        self.save()

    def prepare_estimator_cloned_name(self):
        last_name = self._last_name_with_suffix(self)
        suffix = int(last_name.split(
            self.suffix_sep)[-1]) + 1 if last_name else 1
        name = '{name}{sep}{suffix}'.format(name=self.name,
                                            sep=self.suffix_sep,
                                            suffix=suffix)
        return name

    def clone(self):
        cloned = Estimator.objects.create(
            name=self.prepare_estimator_cloned_name(),
            project=self.project,
            estimator_type=self.estimator_type,
            classes=self.classes,
            configuration=self.configuration,
            metadata=self.metadata,
            image_files=self.image_files,
        )
        return cloned
    

    def describe_annotations(self):
        result = {}
        annotations = Annotation.objects.filter(estimator=self)
        for annotation in annotations:
            image = annotation.image_tile.source_image_file
            result[image] = {} if image not in result else result[image]
            for segment in annotation.segments:
                label = segment['label']
                result[image][label] = 1 if label not in result[image] else result[image][label] + 1
        return result

    def check_related_file_crs(self, path):
        file = File.objects.get(project=self.project, path=path, complete=True)
        crs, _ = get_raster_metadata(file)
        try:
            crs = CRS.from_string(crs)
            return crs.is_valid
        except:
            return False


def tile_images_path(instance, filename):
    raster_fname = os.path.basename(instance.source_image_file)
    return 'project_{project_id}/tiles/{raster_fname}/{filename}'.format(
        project_id=instance.project.id,
        raster_fname=raster_fname,
        filename=filename)


def tile_images_storage_path(instance, filename):
    return 'project_{project_id}/{source_tile_path}/{filename}'.format(
        project_id=instance.project.id,
        source_tile_path=instance.source_tile_path,
        filename=filename)


def get_random_integer_value():
    return random.randint(-2147483648, 2147483647)


class ImageTile(models.Model):
    source_image_file = models.CharField(max_length=512,
                                         verbose_name=_('source image path'))
    source_tile_path = models.CharField(max_length=512, default="")
    project = models.ForeignKey(Project,
                                null=True,
                                on_delete=models.CASCADE,
                                verbose_name=_('project'),
                                related_name=_('tiles'))
    col_off = models.IntegerField(default=0)
    row_off = models.IntegerField(default=0)
    width = models.IntegerField(default=0)
    height = models.IntegerField(default=0)
    tile_file = models.FileField(upload_to=tile_images_storage_path,
                                 verbose_name=_('image'),
                                 max_length=512)
    index = models.IntegerField(default=get_random_integer_value)

    class Meta:
        unique_together = (('source_tile_path', 'source_image_file', 'col_off',
                            'row_off', 'width', 'height'))
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


    def __str__(self):
        return 'Annotation for {image_tile} with {segments} segments'.format(
            image_tile=self.image_tile, segments=len(self.segments))
