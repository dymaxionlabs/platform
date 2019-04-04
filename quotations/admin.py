import math

from django.contrib.gis import admin

from terra.admin import OSMStackedInline

from .models import Request, RequestArea, RequestStateUpdate


class RequestAreaInline(OSMStackedInline):
    model = RequestArea
    modifiable = False
    can_delete = False
    extra = 0


class RequestStateUpdateInline(admin.TabularInline):
    model = RequestStateUpdate
    extra = 0


class RequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'state', 'email', 'message', 'created_at',
                    'total_area')
    list_display_links = ('id', 'name')
    inlines = [RequestAreaInline, RequestStateUpdateInline]
    search_fields = ('name', 'message', 'email')
    list_per_page = 25
    modifiable = False

    def total_area(self, obj):
        return "{} km²".format(math.ceil(obj.total_area))

    def state_name(self, obj):
        return _(obj.state)


admin.site.register(Request, RequestAdmin)
