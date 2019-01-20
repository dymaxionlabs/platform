from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField, JSONField
from django.contrib.gis.db import models


class Quotation(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)
    areas_geom = models.MultiPolygonField(null=True, blank=True)
    layers = ArrayField(models.CharField(max_length=30))
    extra_fields = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
