from rest_framework import serializers

from .models import Estimator


class EstimatorSerializer(serializers.ModelSerializer):
    project = serializers.SlugRelatedField(slug_field='uuid', read_only=True)

    class Meta:
        model = Estimator
        exclude = ('id', )