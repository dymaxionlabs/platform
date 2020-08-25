from rest_framework import serializers

from projects.mixins import allowed_projects_for
from projects.models import Project
from tasks.models import Task
from tasks.serializers import TaskSerializer
from .models import Annotation, Estimator, ImageTile


def non_empty(value):
    if not value:
        raise serializers.ValidationError('This field is required.')


class ProjectSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        return allowed_projects_for(Project.objects, user)


class EstimatorSlugField(serializers.SlugRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        projects = allowed_projects_for(Project.objects, user)
        return Estimator.objects.filter(project__in=projects)


class EstimatorSerializer(serializers.ModelSerializer):
    project = ProjectSlugField(slug_field='uuid')
    classes = serializers.ListField()
    training_tasks = serializers.SerializerMethodField()
    prediction_tasks = serializers.SerializerMethodField()

    def get_training_tasks(self, obj):
        tasks = Task.objects.filter(
            kwargs__estimator=str(obj.uuid),
            name=Estimator.TRAINING_JOB_TASK).order_by('-created_at')
        return TaskSerializer(tasks, many=True).data

    def get_prediction_tasks(self, obj):
        tasks = Task.objects.filter(
            kwargs__estimator=str(obj.uuid),
            name=Estimator.PREDICTION_JOB_TASK).order_by('-created_at')
        return TaskSerializer(tasks, many=True).data

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
