from rest_framework import serializers

from projects.mixins import allowed_projects_for
from projects.models import File, Project

from .models import Annotation, Estimator, ImageTile


class ProjectSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        return allowed_projects_for(Project.objects, user)


class FileSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        queryset = File.objects.filter(owner=user)
        return queryset


class EstimatorSerializer(serializers.ModelSerializer):
    project = ProjectSlugField(slug_field='uuid')
    image_files = FileSlugField(many=True, slug_field='name', required=False)

    class Meta:
        model = Estimator
        exclude = ('id', )


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = '__all__'


class ImageTileSerializer(serializers.ModelSerializer):
    file = serializers.SlugRelatedField(slug_field='name', read_only=True)

    class Meta:
        model = ImageTile
        fields = '__all__'