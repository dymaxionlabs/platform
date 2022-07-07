from rest_framework import serializers
from ml_models.models import MLModel


class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')