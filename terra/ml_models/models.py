from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import ugettext_lazy as _



# Create your models here.
class MLModel(models.Model):
    name = models.CharField(_('name'), max_length=134)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    description = models.TextField(_('description'))
    tags = ArrayField(
        models.CharField(max_length=30),
        verbose_name=_('tags')
    )
    version = models.CharField(_('version'), max_length=10, null=True)
    repo_url = models.URLField(_('git repository url'), null=True)
    is_public = models.BooleanField(_('is public'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)