from rest_framework import serializers
from tasks.models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'name', 'args', 'kwargs', 'state', 'created_at',
                  'finished_at', 'updated_at', 'metadata', 'duration',
                  'estimated_duration')
