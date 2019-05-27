from django.contrib import admin

from .models import Estimator, ImageTile, Annotation


class EstimatorAdmin(admin.ModelAdmin):
    list_display = ('project', 'name', 'estimator_type', 'classes', 'uuid')


admin.site.register(Estimator, EstimatorAdmin)
admin.site.register(ImageTile)
admin.site.register(Annotation)
