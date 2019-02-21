from django.contrib import admin

from .models import UserProfile, Client, Project, LayerCollection, Layer


class ProjectAdmin(admin.ModelAdmin):
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {"slug": ("name", )}


class LayerCollectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'layer_type', 'project', 'slug',
                    'description', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {"slug": ("name", )}


class LayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'layer_collection', 'date', 'created_at',
                    'tiles_url')
    list_display_links = ('id', 'layer_collection', 'date')
    search_fields = ('layer_collection', 'date')


admin.site.register(UserProfile)
admin.site.register(Client)
admin.site.register(Project, ProjectAdmin)
admin.site.register(LayerCollection, LayerCollectionAdmin)
admin.site.register(Layer, LayerAdmin)