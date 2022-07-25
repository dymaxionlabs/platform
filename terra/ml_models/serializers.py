from rest_framework import serializers
from ml_models.models import MLModel, MLModelVersion


class BaseMeta:
    read_only_fields = ("created_at", "updated_at")

class MLModelSerializer(serializers.ModelSerializer):
    owner = serializers.SlugRelatedField(read_only=True, slug_field="username")
    latest_version = serializers.SerializerMethodField()

    class Meta(BaseMeta):
        model = MLModel
        exclude = (
            "id",
            "lf_project_id",
        )

    def get_latest_version(self, obj):
        version = obj.latest_version
        return version.name if version else None


class MLModelVersionSerializer(serializers.ModelSerializer):
    model = serializers.SerializerMethodField()

    class Meta(BaseMeta):
        model = MLModelVersion
        exclude = ("id",)

    def get_model(self, obj):
        return str(obj.model)
