import binascii
import os
import time
import uuid

import django_rq
from django.conf import settings
from django.contrib.auth.models import Group, User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.translation import gettext as _
from guardian.shortcuts import assign_perm
from rest_framework_api_key.models import AbstractAPIKey


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=40, blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=60, blank=True)
    in_beta = models.BooleanField(_("In Beta"), default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Project(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    owners = models.ManyToManyField(User)

    # FIXME Deprecated, replaced by object-level permissions
    groups = models.ManyToManyField(Group, blank=True)

    name = models.CharField(_("Name"), max_length=80, unique=True)
    description = models.CharField(_("Description"),
                                   max_length=255,
                                   blank=True)
    no_images = models.BooleanField(_("No images"), default=False)

    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    class Meta:
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")

    def __str__(self):
        return self.name


class ProjectInvitationToken(models.Model):
    key = models.CharField(_("Key"), max_length=40, primary_key=True)

    project = models.ForeignKey(Project,
                                on_delete=models.CASCADE,
                                verbose_name=_("Project"))
    email = models.CharField(_("Email"),
                             max_length=75,
                             blank=True,
                             default=None,
                             null=True)
    confirmed = models.BooleanField(_("Confirmed"), default=False)

    created_at = models.DateTimeField(_("Created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)

    class Meta:
        unique_together = (('project', 'email'), )
        verbose_name = _("Project invitation token")
        verbose_name_plural = _("Project invitation tokens")

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)

    def generate_key(self):
        return binascii.hexlify(os.urandom(20)).decode()

    def confirm_for(self, user):
        assign_perm('view_project', user, self.project)
        self.confirmed = True
        self.save(update_fields=["confirmed"])

    def __str__(self):
        return self.key


def user_images_path(instance, filename):
    return 'user_{user_id}/{filename}'.format(user_id=instance.owner.id,
                                              filename=filename)


class File(models.Model):
    suffix_sep = '__'

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project,
                                on_delete=models.CASCADE,
                                verbose_name=_("Project"),
                                default=None,
                                blank=True,
                                null=True)

    file = models.FileField(upload_to=user_images_path)
    name = models.CharField(max_length=255)
    metadata = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('owner', 'project', 'name'), )

    def __str__(self):
        return self.name

    @classmethod
    def prepare_filename(cls, filename):
        if cls._does_already_exists(filename):
            last_fname = cls._last_filename_with_suffix(filename)
            if last_fname:
                suff_name, _ = os.path.splitext(last_fname)
                suffix = int(suff_name.split(cls.suffix_sep)[-1]) + 1
            else:
                suffix = 1
            name, ext = os.path.splitext(filename)
            filename = '{name}{sep}{suffix}{ext}'.format(name=name,
                                                         sep=cls.suffix_sep,
                                                         suffix=suffix,
                                                         ext=ext)

        return filename

    @classmethod
    def _does_already_exists(cls, filename):
        return cls.objects.filter(name=filename).exists()

    @classmethod
    def _last_filename_with_suffix(cls, filename):
        name, ext = os.path.splitext(filename)
        files = cls.objects.filter(name__startswith='{name}{sep}'.format(
            sep=cls.suffix_sep, name=name)).filter(name__endswith=ext)
        last_file = files.last()
        return last_file and last_file.name


class Layer(models.Model):
    RASTER = 'R'
    VECTOR = 'V'
    LAYER_CHOICES = (
        (RASTER, 'Raster'),
        (VECTOR, 'Vector'),
    )
    BASE_TILE_URL = 'https://storage.googleapis.com/{bucket}/{uuid}'

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    layer_type = models.CharField(max_length=1,
                                  choices=LAYER_CHOICES,
                                  default=RASTER)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    area_geom = models.PolygonField()
    date = models.DateField(null=True, blank=True)
    file = models.OneToOneField(File,
                                blank=True,
                                null=True,
                                on_delete=models.SET_NULL)
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('project', 'name', 'date'), )

    def __str__(self):
        return '{name} ({date})'.format(name=self.name, date=self.date)

    def tiles_url(self):
        base_url = self.BASE_TILE_URL.format(bucket=settings.TILES_BUCKET,
                                             uuid=self.uuid)
        return base_url + '/{z}/{x}/{y}.' + self.tiles_extension()

    def tiles_bucket_url(self):
        return 'gs://{bucket}/{uuid}'.format(bucket=settings.TILES_BUCKET,
                                             uuid=self.uuid)

    def tiles_extension(self):
        if self.layer_type == self.RASTER:
            return 'png'
        elif self.layer_type == self.VECTOR:
            return 'pbf'
        else:
            raise TypeError('unknown layer type {}'.format(self.layer_type))

    def extent(self):
        """ Get area extent """
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
                    "fillOpacity": 0.5
                }
            }
        }
        return style


class Map(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('project', 'name'), )

    def __str__(self):
        return self.name

    def extent(self):
        """ Get map extent based on first active layer """
        active_map_layer = self.layers.filter(is_active=True).first()
        return active_map_layer and active_map_layer.layer.extent()


class MapLayer(models.Model):
    map = models.ForeignKey(Map,
                            related_name='layers',
                            on_delete=models.CASCADE)
    layer = models.OneToOneField(Layer, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = (('map', 'order'), ('map', 'layer'))
        ordering = ('order', )

    def __str__(self):
        return '{layer_name} ({map_name})'.format(layer_name=self.layer.name,
                                                  map_name=self.map.name)

    def save(self, swapping=False, *args, **kwargs):
        if not self.id:
            try:
                self.order = self.max_order() + 1
            except IndexError:
                self.order = 1  # 0 is a special index used in swap
        if self.order == 0 and not swapping:
            raise ValidationError(_('Cannot set order to 0'), code='invalid')
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
        return cls.objects.order_by('-order')[0].order


class UserAPIKey(AbstractAPIKey):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta(AbstractAPIKey.Meta):
        verbose_name = "User API key"
        verbose_name_plural = "User API keys"
