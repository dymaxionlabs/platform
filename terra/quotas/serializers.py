from rest_framework import serializers
from .models import UserQuota

class UserQuotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuota
        fields = (
            'user', 
            'max_projects_per_user', 
            'max_file_size', 
            'total_space_per_user', 
        )