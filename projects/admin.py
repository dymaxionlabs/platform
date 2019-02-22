from django.contrib import admin

from .models import UserProfile, Project, Layer, Map


class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'group_names', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name', )}

    def group_names(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])


class LayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'layer_type', 'project', 'date',
                    'created_at', 'tiles_url')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'project', 'slug', 'layer_type',
                     'date')
    prepopulated_fields = {'slug': ('name', )}


class MapAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'project', 'is_private',
                    'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'project', 'slug', 'is_private')
    prepopulated_fields = {'slug': ('name', )}


admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(Map, MapAdmin)