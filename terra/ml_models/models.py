from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
from projects.models import CreatedAtUpdatedAtModelMixin
from mdeditor.fields import MDTextField


class MLModel(CreatedAtUpdatedAtModelMixin, models.Model):
    name = models.CharField(_("name"), max_length=134)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    description = MDTextField()
    tags = ArrayField(
        models.CharField(max_length=30), verbose_name=_("tags"), null=True, blank=True
    )
    lf_project_id = models.CharField(max_length=123)
    repo_url = models.URLField(_("git repository url"), blank=True, null=True)
    is_public = models.BooleanField(_("is public"), default=False)

    
    class Meta:
        verbose_name = "Model"
        unique_together = ("name", "owner")

    @property
    def latest_version(self):
        return self.mlmodelversion_set.order_by("name").last()

    def __str__(self):
        return f"{self.owner.username}/{self.name}"


class MLModelVersion(CreatedAtUpdatedAtModelMixin, models.Model):
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    name = models.CharField(_("name"), max_length=100)
    description = models.TextField(_("description"), blank=True, null=True)
    
    class Meta:
        unique_together = ("model", "name")

    def __str__(self):
        return f"{self.model}@{self.name}"
