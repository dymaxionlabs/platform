from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from .models import Request, RequestArea, RequestStateUpdate


class RequestAreaSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RequestArea
        geo_field = 'area_geom'
        fields = ('area_geom', )


class RequestStateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestStateUpdate
        fields = '__all__'


class RequestSerializer(serializers.ModelSerializer):
    areas = RequestAreaSerializer(many=True)
    last_state_update = RequestStateUpdateSerializer(read_only=True)
    user = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = Request
        fields = '__all__'

    def create(self, validated_data):
        areas_data = validated_data.pop('areas')
        request = Request.objects.create(**validated_data)
        for area_data in areas_data:
            RequestArea.objects.create(request=request, **area_data)
        return request
