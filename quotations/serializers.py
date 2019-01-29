from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from .models import Quotation, QuotationArea


class QuotationAreaSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = QuotationArea
        geo_field = 'area_geom'
        fields = ('area_geom', )


class QuotationSerializer(serializers.HyperlinkedModelSerializer):
    areas = QuotationAreaSerializer(many=True)

    class Meta:
        model = Quotation
        fields = ('url', 'name', 'email', 'message', 'layers', 'areas',
                  'extra_fields', 'user', 'created_at')

    def create(self, validated_data):
        areas_data = validated_data.pop('areas')
        quotation = Quotation.objects.create(**validated_data)
        for area_data in areas_data:
            QuotationArea.objects.create(quotation=quotation, **area_data)
        return quotation
