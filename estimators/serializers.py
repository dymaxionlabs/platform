from rest_framework import serializers

from projects.mixins import allowed_projects_for
from projects.models import File, Project

from .models import Annotation, Estimator, ImageTile


def non_empty(value):
    if not value:
        raise serializers.ValidationError('This field is required.')


class ProjectSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        return allowed_projects_for(Project.objects, user)


class FileSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        return File.objects.filter(owner=user)


class EstimatorSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        projects = allowed_projects_for(Project.objects, user)
        return Estimator.objects.filter(project__in=projects)


class EstimatorSerializer(serializers.ModelSerializer):
    project = ProjectSlugField(slug_field='uuid')
    image_files = FileSlugField(many=True, slug_field='name', required=False)
    classes = serializers.ListField(required=True, validators=[non_empty])

    class Meta:
        model = Estimator
        exclude = ('id', )


class ImageTileSerializer(serializers.ModelSerializer):
    file = serializers.SlugRelatedField(slug_field='name', read_only=True)

    class Meta:
        model = ImageTile
        fields = '__all__'


class AnnotationSerializer(serializers.ModelSerializer):
    estimator = EstimatorSlugField(slug_field='uuid')

    # TODO Validate segments field

    class Meta:
        model = Annotation
        exclude = ('id', )