from django.contrib.auth.models import Group, User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.validators import MaxValueValidator, MinValueValidator


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    location = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=40, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Project(models.Model):
    groups = models.ManyToManyField(Group)

    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, null=True, blank=True)
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
    description = models.CharField(max_length=255, null=True, blank=True)
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
    layers = models.ManyToManyField(Layer)

    name = models.CharField(max_length=80)
    description = models.CharField(max_length=255, null=True, blank=True)
    slug = models.SlugField()
    center = models.PointField()
    zoom = models.IntegerField(
        default=13, validators=[MaxValueValidator(22),
                                MinValueValidator(1)])
    is_private = models.BooleanField(default=True)
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
