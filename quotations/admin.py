from django.contrib.gis import admin

from terra.admin import OSMStackedInline

from .models import Quotation, QuotationArea


class QuotationAreaInline(OSMStackedInline):
    model = QuotationArea
    modifiable = False
    can_delete = False
    extra = 0


class QuotationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'message', 'created_at',
                    'total_area')
    list_display_links = ('id', 'name')
    inlines = [QuotationAreaInline]
    search_fields = ('name', 'message', 'email')
    list_per_page = 25
    modifiable = False

    def total_area(self, obj):
        return "{} km²".format(
            round(sum(area.area_km2() for area in obj.areas.all())))


admin.site.register(Quotation, QuotationAdmin)
