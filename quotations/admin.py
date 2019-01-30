from django.contrib.gis import admin

from .models import Quotation, QuotationArea


class QuotationAdmin(admin.OSMGeoAdmin):
    list_display = ('id', 'name', 'email', 'message', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'message', 'email')
    list_per_page = 25
    modifiable = False


class QuotationAreaAdmin(admin.OSMGeoAdmin):
    list_display = ('area',)
    list_display_links = ('area',)
    default_lat = -34.603683
    default_lon = -58.381557
    default_zoom = 17
    modifiable = False

    def area(self, obj):
        geom = obj.area_geom
        geom.transform(32721)
        return "{} km²".format(round(geom.area / 10000, 2))


admin.site.register(Quotation, QuotationAdmin)
admin.site.register(QuotationArea, QuotationAreaAdmin)
