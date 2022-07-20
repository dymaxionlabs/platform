from rest_framework import serializers
from ml_models.models import MLModel, MLModelVersion


class BaseMeta:
    read_only_fields = ("created_at", "updated_at")


class MLModelSerializer(serializers.ModelSerializer):
    class Meta(BaseMeta):
        model = MLModel
        exclude = ("lf_project_id",)


class MLModelVersionSerializer(serializers.ModelSerializer):
    class Meta(BaseMeta):
        model = MLModelVersion
        fields = "__all__"
