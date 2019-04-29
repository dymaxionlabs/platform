from rest_framework import serializers

from projects.models import Project

from .models import Estimator


class SlugRelatedUserField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        if user.is_staff:
            queryset = Project.objects.all()
        else:
            queryset = user.projects.all()
        return queryset


class EstimatorSerializer(serializers.ModelSerializer):
    project = SlugRelatedUserField(slug_field='uuid')

    class Meta:
        model = Estimator
        exclude = ('id', )