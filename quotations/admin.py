from django.contrib.gis import admin

from .models import Quotation

admin.site.register(Quotation, admin.OSMGeoAdmin)
