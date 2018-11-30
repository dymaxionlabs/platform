from django.contrib import admin

from .models import Client, Project, Layer, LayerImage


class ProjectAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name", )}


class LayerAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name", )}


admin.site.register(Client)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(LayerImage)