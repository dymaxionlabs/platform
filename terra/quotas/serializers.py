from rest_framework import serializers
from .models import UserQuota

class UserQuotaSerializer(serializers.ModelSerializer):
    max_estimator_per_project = serializers.SerializerMethodField()

    class Meta:
        model = UserQuota
        fields = (
            'user',
            'max_projects_per_user',
            'max_file_size',
            'total_space_per_user',
            'max_estimator_per_project',
        )

    def get_max_estimator_per_project(self, obj):
        """deprecated"""
        return 0