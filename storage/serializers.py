from rest_framework import serializers


class FileSerializer(serializers.BaseSerializer):
    name = serializers.CharField(read_only=True)
    metadata = serializers.JSONField()