from rest_framework import serializers


class FileSerializer(serializers.BaseSerializer):
    def to_representation(self, instance):
        return dict(name=instance.name,
                    path=instance.path,
                    metadata=instance.metadata)