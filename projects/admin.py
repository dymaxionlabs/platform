from django.contrib import admin

from .models import Layer, Map, MapLayer, Project, UserProfile


class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'group_names', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')

    def group_names(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])


class LayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'layer_type', 'project', 'date',
                    'created_at', 'tiles_url')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'project', 'layer_type', 'date')


class MapLayerInline(admin.TabularInline):
    model = MapLayer


class MapAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'project', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'project')
    inlines = [MapLayerInline]


admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(Map, MapAdmin)
