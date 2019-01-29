from django.contrib.gis import admin

from .models import Quotation, QuotationArea


class QuotationAdmin(admin.OSMGeoAdmin):
    list_display = ('id', 'name', 'email', 'message', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'message', 'email')
    list_per_page = 25
    modifiable = False


class QuotationAreaAdmin(admin.OSMGeoAdmin):
    default_lat = -34.603683
    default_lon = -58.381557
    default_zoom = 17
    modifiable = False


admin.site.register(Quotation, QuotationAdmin)
admin.site.register(QuotationArea, QuotationAreaAdmin)
