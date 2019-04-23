from django.contrib import admin

from .models import Estimator, ImageTile, Annotation

admin.site.register(Estimator)
admin.site.register(ImageTile)
admin.site.register(Annotation)
