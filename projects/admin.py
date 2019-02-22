from django.contrib import admin

from .models import UserProfile, Project, Layer, Map


class ProjectAdmin(admin.ModelAdmin):
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name', )}


class LayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'layer_type', 'name', 'description',
                    'date', 'created_at', 'tiles_url')
    list_display_links = ('id', 'name')
    search_fields = ('project', 'layer_type', 'name', 'description', 'date')
    prepopulated_fields = {'slug': ('name', )}


admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(Map)