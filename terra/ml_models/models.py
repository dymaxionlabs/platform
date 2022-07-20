from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _


class MLModel(models.Model):
    name = models.CharField(_('name'), max_length=134)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    description = models.TextField(_('description'), blank=True, null=True)
    tags = ArrayField(
        models.CharField(max_length=30),
        verbose_name=_('tags'),
        null=True,
        blank=True
    )
    lf_project_id = models.CharField(max_length=123)
    repo_url = models.URLField(_('git repository url'), blank=True, null=True)
    is_public = models.BooleanField(_('is public'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        unique_together = ('name', 'owner')

    def __str__(self):
        return f'{self.owner.username}/{self.name}'

class MLModelVersion(models.Model):
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True, null=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        unique_together = ('model', 'name')

    def __str__(self):
        return f'{self.model}@{self.name}'