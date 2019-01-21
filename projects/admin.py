from django.contrib import admin

from .models import UserProfile, Client, Project, Layer, LayerImage


class ProjectAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name", )}


class LayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'project', 'slug',
                    'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {"slug": ("name", )}


class LayerImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'layer', 'date', 'created_at')
    list_display_links = ('id', 'layer')
    search_fields = ('layer', 'date')


admin.site.register(UserProfile)
admin.site.register(Client)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(LayerImage, LayerImageAdmin)