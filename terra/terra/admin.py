import copy
import csv

from django.contrib import admin
from django.contrib.admin import options
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.gis import admin
from django.http import HttpResponse


class OSMInlineModelAdmin(admin.OSMGeoAdmin, options.InlineModelAdmin):
    def __init__(self, parent_model, admin_site):
        self.admin_site = admin_site
        self.parent_model = parent_model
        self.opts = self.model._meta
        self.has_registered_model = admin_site.is_registered(self.model)
        overrides = copy.deepcopy(options.FORMFIELD_FOR_DBFIELD_DEFAULTS)
        for k, v in self.formfield_overrides.items():
            overrides.setdefault(k, {}).update(v)
        self.formfield_overrides = overrides
        if self.verbose_name is None:
            self.verbose_name = self.model._meta.verbose_name
        if self.verbose_name_plural is None:
            self.verbose_name_plural = self.model._meta.verbose_name_plural


class OSMStackedInline(OSMInlineModelAdmin, admin.StackedInline):
    pass


class OSMTabularInline(OSMInlineModelAdmin, admin.TabularInline):
    pass


class ExportCsvMixin:
    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename={}.csv".format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])

        return response

    export_as_csv.short_description = "Export Selected"


class CustomUserAdmin(UserAdmin, ExportCsvMixin):
    actions = ["export_as_csv"]


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
