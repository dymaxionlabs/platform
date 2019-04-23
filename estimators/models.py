import uuid

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.translation import gettext as _

from projects.models import Project


class Estimator(models.Model):
    OBJECT_DETECTION = 'OD'
    CLASSIFICATION = 'C'
    TYPE_CHOICES = ((OBJECT_DETECTION, _('Object detection')),
                    # (CLASSIFICATION, _('Classification')),
                    )

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(
        Project,
        null=True,
        on_delete=models.CASCADE,
        verbose_name=_('project'))

    estimator_type = models.CharField(
        _('estimator type'),
        max_length=2,
        choices=TYPE_CHOICES,
        default=OBJECT_DETECTION)
    name = models.CharField(_('name'), max_length=255)
    classes = ArrayField(models.CharField(max_length=32), default=list)
    metadata = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        unique_together = (('project', 'estimator_type', 'name'), )

    def __str__(self):
        return '{name} ({type})'.format(
            name=self.name, type=self.estimator_type)
