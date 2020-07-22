import os
from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return os.path.basename(obj.path)

    class Meta:
        model = File
        exclude = ('complete',)