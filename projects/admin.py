from django.contrib import admin

from .models import Client, Project, Layer, LayerImage

admin.site.register(Client)
admin.site.register(Project)
admin.site.register(Layer)
admin.site.register(LayerImage)