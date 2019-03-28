from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from .models import Request, RequestArea


class RequestAreaSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RequestArea
        geo_field = 'area_geom'
        fields = ('area_geom', )


class RequestSerializer(serializers.HyperlinkedModelSerializer):
    areas = RequestAreaSerializer(many=True)

    class Meta:
        model = Request
        fields = ('url', 'name', 'email', 'message', 'layers', 'areas',
                  'extra_fields', 'user', 'created_at')

    def create(self, validated_data):
        areas_data = validated_data.pop('areas')
        request = Request.objects.create(**validated_data)
        for area_data in areas_data:
            RequestArea.objects.create(request=request, **area_data)
        return request
