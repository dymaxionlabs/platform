from rest_framework import serializers
from tasks.models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'name', 'updated_at', 'created_at', 'finished_at',
                  'state', 'metadata', 'duration', 'estimated_duration',
                  'args', 'kwargs')
