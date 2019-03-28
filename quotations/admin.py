from django.contrib.gis import admin

from terra.admin import OSMStackedInline

from .models import Request, RequestArea


class RequestAreaInline(OSMStackedInline):
    model = RequestArea
    modifiable = False
    can_delete = False
    extra = 0


class RequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'message', 'created_at',
                    'total_area')
    list_display_links = ('id', 'name')
    inlines = [RequestAreaInline]
    search_fields = ('name', 'message', 'email')
    list_per_page = 25
    modifiable = False

    def total_area(self, obj):
        return "{} km²".format(
            round(sum(area.area_km2() for area in obj.areas.all())))


admin.site.register(Request, RequestAdmin)
