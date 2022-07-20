from django.contrib import admin

from .models import MLModel, MLModelVersion


class MLModelVersionInline(admin.TabularInline):
    model = MLModelVersion


class MLModelAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "owner",
        "name",
        "description",
        "is_public",
        "created_at",
        "updated_at",
        "latest_version",
    )
    inlines = [MLModelVersionInline]

    def latest_version(self, obj):
        last_version = obj.mlmodelversion_set.last()
        return last_version.name if last_version else "-"


admin.site.register(MLModel, MLModelAdmin)
