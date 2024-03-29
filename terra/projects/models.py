import binascii
import os
import uuid

from django.conf import settings
from django.contrib.auth.models import Group, User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from guardian.shortcuts import assign_perm
from rest_framework_api_key.models import AbstractAPIKey


class CreatedAtUpdatedAtModelMixin(models.Model):
    """
    Model that has the `created_at` & `updated_at` fields and is
    by default ordered by `created_at`
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ("-created_at",)


class UserProfile(CreatedAtUpdatedAtModelMixin, models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=40, blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=60, blank=True)
    beta = models.BooleanField(default=False)
    send_notification_emails = models.BooleanField(default=True)


class Project(CreatedAtUpdatedAtModelMixin, models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name=_("projects")
    )
    collaborators = models.ManyToManyField(User)
    # FIXME Deprecated, replaced by object-level permissions
    groups = models.ManyToManyField(Group, blank=True)

    name = models.CharField(_("Name"), max_length=80)
    description = models.CharField(_("Description"), max_length=255, blank=True)
    no_images = models.BooleanField(_("No images"), default=False)
    dashboards_module = models.BooleanField(
        _("Enable Dashboards module"), default=False
    )

    class Meta:
        unique_together = (("owner", "name"),)
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")

    def __str__(self):
        return self.name


class ProjectInvitationToken(CreatedAtUpdatedAtModelMixin, models.Model):
    key = models.CharField(_("Key"), max_length=40, primary_key=True)

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, verbose_name=_("Project")
    )
    email = models.CharField(
        _("Email"), max_length=75, blank=True, default=None, null=True
    )
    confirmed = models.BooleanField(_("Confirmed"), default=False)

    class Meta:
        unique_together = (("project", "email"),)
        verbose_name = _("Project invitation token")
        verbose_name_plural = _("Project invitation tokens")

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    def generate_key(self):
        return binascii.hexlify(os.urandom(20)).decode()

    def confirm_for(self, user):
        assign_perm("view_project", user, self.project)
        self.confirmed = True
        self.save(update_fields=["confirmed"])

    def __str__(self):
        return self.key


class Layer(CreatedAtUpdatedAtModelMixin, models.Model):
    RASTER = "R"
    VECTOR = "V"
    LAYER_CHOICES = (
        (RASTER, "Raster"),
        (VECTOR, "Vector"),
    )
    BASE_TILE_URL = "https://storage.googleapis.com/{bucket}/{uuid}"

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    layer_type = models.CharField(max_length=1, choices=LAYER_CHOICES, default=RASTER)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    area_geom = models.PolygonField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    extra_fields = JSONField(null=True, blank=True)
    use_cog_tiles = models.BooleanField(default=True)

    class Meta:
        unique_together = (("project", "name", "date"),)

    def __str__(self):
        return "{name} ({date})".format(name=self.name, date=self.date)

    def tiles_url(self):
        base_url = self.BASE_TILE_URL.format(
            bucket=settings.TILES_BUCKET, uuid=self.uuid
        )
        return base_url + "/{z}/{x}/{y}." + self.tiles_extension()

    def tiles_bucket_url(self):
        return "gs://{bucket}/{uuid}".format(
            bucket=settings.TILES_BUCKET, uuid=self.uuid
        )

    def tiles_extension(self):
        if self.layer_type == self.RASTER:
            return "png"
        elif self.layer_type == self.VECTOR:
            return "pbf"
        else:
            raise TypeError("unknown layer type {}".format(self.layer_type))

    def extent(self):
        """Get area extent"""
        return self.area_geom and self.area_geom.extent

    @classmethod
    def styleByOrder(cls, order, class_name):
        style = {
            "styles": {
                class_name: {
                    "fill": True,
                    "color": order % len(settings.LAYERS_COLOR),
                    "stroke": True,
                    "weight": 0.5,
                    "fillColor": order % len(settings.LAYERS_FILL_COLOR),
                    "fillOpacity": 0.5,
                }
            }
        }
        return style


class Map(CreatedAtUpdatedAtModelMixin, models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    extra_fields = JSONField(null=True, blank=True)

    class Meta:
        unique_together = (("project", "name"),)

    def __str__(self):
        return self.name

    def extent(self):
        """Get map extent based on first active layer"""
        active_map_layer = self.layers.filter(is_active=True).first()
        return active_map_layer and active_map_layer.layer.extent()


class MapLayer(models.Model):
    map = models.ForeignKey(Map, related_name="layers", on_delete=models.CASCADE)
    layer = models.ForeignKey(Layer, related_name="maps", on_delete=models.CASCADE)
    order = models.PositiveIntegerField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("map", "layer", "order")
        ordering = ("order",)

    def __str__(self):
        return "{layer_name} ({map_name})".format(
            layer_name=self.layer.name, map_name=self.map.name
        )

    def save(self, swapping=False, *args, **kwargs):
        if not self.id:
            try:
                self.order = self.max_order() + 1
            except IndexError:
                self.order = 1  # 0 is a special index used in swap
        if self.order == 0 and not swapping:
            raise ValidationError(_("Cannot set order to 0"), code="invalid")
        super().save(*args, **kwargs)

    @classmethod
    def swap(cls, obj1, obj2):
        tmp, obj2.order = obj2.order, 0
        obj2.save(swapping=True)
        obj2.order, obj1.order = obj1.order, tmp
        obj1.save()
        obj2.save()

    @classmethod
    def max_order(cls):
        return cls.objects.order_by("-order")[0].order


class Dashboard(CreatedAtUpdatedAtModelMixin, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)
    url = models.URLField()
    name = models.CharField(max_length=80)

    class Meta:
        unique_together = (("project", "url"),)

    def __str__(self):
        return self.name


class UserAPIKey(CreatedAtUpdatedAtModelMixin, AbstractAPIKey):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    class Meta(AbstractAPIKey.Meta):
        verbose_name = "User API key"
        verbose_name_plural = "User API keys"
