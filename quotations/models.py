from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.translation import gettext as _


class Request(models.Model):
    user = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)
    layers = ArrayField(models.CharField(max_length=30), null=True, blank=True)
    extra_fields = JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        layers_sentence = ', '.join(self.layers)
        return 'Request from {} for layers: {}'.format(self.name,
                                                       layers_sentence)


class RequestArea(models.Model):
    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name='areas')
    area_geom = models.PolygonField()

    def area_km2(self):
        geom = self.area_geom
        geom.transform(32721)
        return geom.area / 10000

    def __str__(self):
        return "Area of {} km²".format(round(self.area_km2()))
