from django.contrib.auth.models import Group, User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=40, blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=60, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Project(models.Model):
    groups = models.ManyToManyField(Group)

    name = models.CharField(max_length=80)
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
    BASE_TILE_URL = 'https://storage.googleapis.com/dym-tiles/{project_slug}/{slug}'

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
        unique_together = (('project', 'slug', 'date'), )

    def __str__(self):
        return '{name} ({date})'.format(name=self.name, date=self.date)

    def tiles_url(self):
        base_url = self.BASE_TILE_URL.format(
            project_slug=self.project.slug, slug=self.slug)
        date_str = self.date.strftime('%Y-%m-%d')
        ext = self.tiles_extension()
        return '{base_url}/{date}'.format(
            base_url=base_url, date=date_str) + '/{z}/{x}/{y}.' + ext

    def tiles_extension(self):
        if self.layer_type == self.RASTER:
            return 'png'
        elif self.layer_type == self.VECTOR:
            return 'pbf'
        else:
            raise TypeError('unknown layer type {}'.format(self.layer_type))


class Map(models.Model):
    project = models.ForeignKey(Project, null=True, on_delete=models.SET_NULL)

    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, blank=True)
    slug = models.SlugField()
    center = models.PointField()
    zoom = models.IntegerField(
        default=13, validators=[MaxValueValidator(22),
                                MinValueValidator(1)])
    is_private = models.BooleanField(default=True)
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MapLayer(models.Model):
    map = models.ForeignKey(Map, on_delete=models.CASCADE)
    layer = models.OneToOneField(Layer, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = (('map', 'order'), )
        ordering = ('order', )

    def save(self, swapping=False, *args, **kwargs):
        if not self.id:
            try:
                self.order = self.max_order() + 1
            except IndexError:
                self.order = 1  # 0 is a special index used in swap
        if self.order == 0 and not swapping:
            raise ValidationError("Cannot set order to 0")
        super.save(*args, **kwargs)

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
