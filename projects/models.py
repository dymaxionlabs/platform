from django.contrib.auth.models import Group, User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.translation import gettext as _
import uuid


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=40, blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=60, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Project(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    groups = models.ManyToManyField(Group)

    name = models.CharField(max_length=80, unique=True)
    description = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Layer(models.Model):
    RASTER = 'R'
    VECTOR = 'V'
    LAYER_CHOICES = (
        (RASTER, 'Raster'),
        (VECTOR, 'Vector'),
    )
    BASE_TILE_URL = 'https://storage.googleapis.com/dym-tiles/{uuid}'

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    layer_type = models.CharField(
        max_length=1, choices=LAYER_CHOICES, default=RASTER)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    area_geom = models.PolygonField()
    date = models.DateField()
    slug = models.SlugField()
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('project', 'date'), )

    def __str__(self):
        return '{name} ({date})'.format(name=self.name, date=self.date)

    def tiles_url(self):
        base_url = self.BASE_TILE_URL.format(uuid=self.uuid)
        return base_url + '/{z}/{x}/{y}.' + self.tiles_extension()

    def tiles_extension(self):
        if self.layer_type == self.RASTER:
            return 'png'
        elif self.layer_type == self.VECTOR:
            return 'pbf'
        else:
            raise TypeError('unknown layer type {}'.format(self.layer_type))


class Map(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    slug = models.SlugField()
    center = models.PointField()
    zoom = models.IntegerField(
        default=13, validators=[MaxValueValidator(22),
                                MinValueValidator(1)])
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('project', 'name'), )

    def __str__(self):
        return self.name


class MapLayer(models.Model):
    map = models.ForeignKey(
        Map, related_name='layers', on_delete=models.CASCADE)
    layer = models.OneToOneField(Layer, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = (('map', 'order'), ('map', 'layer'))
        ordering = ('order', )

    def __str__(self):
        return '{layer_name} ({map_name})'.format(
            layer_name=self.layer.name, map_name=self.map.name)

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
