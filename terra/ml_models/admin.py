from django.contrib import admin
from django.contrib.postgres.fields import JSONField
from jsoneditor.forms import JSONEditor

from .models import MLModel, MLModelVersion


class MLModelVersionInline(admin.StackedInline):
    model = MLModelVersion

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


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
