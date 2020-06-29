import copy

from django.contrib.admin import options
from django.contrib.gis import admin


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