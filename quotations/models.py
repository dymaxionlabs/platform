from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField, JSONField
from django.contrib.gis.db import models


class Quotation(models.Model):
    user = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)
    layers = ArrayField(models.CharField(max_length=30), null=True, blank=True)
    extra_fields = JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class QuotationArea(models.Model):
    quotation = models.ForeignKey(
        Quotation, on_delete=models.CASCADE, related_name='areas')
    area_geom = models.PolygonField()

    def __str__(self):
        geom = self.area_geom.transform(32721)
        return "Area of {} km²".format(geom.area / 10000)
