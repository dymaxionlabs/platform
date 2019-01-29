from rest_framework import serializers

from .models import Quotation, QuotationArea


class QuotationAreaSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = QuotationArea
        fields = ('area_geom', )


#class AreaGeomField(serializers.RelatedField):
#    def to_representation(self, value):
#        return value.area_geom
#
#    def to_internal_value(self, data):
#        return QuotationArea.objects.


class QuotationSerializer(serializers.HyperlinkedModelSerializer):
    #areas = AreaGeomField(many=True)
    areas = QuotationAreaSerializer(many=True)

    class Meta:
        model = Quotation
        fields = ('name', 'email', 'message', 'layers', 'areas',
                  'extra_fields', 'user')

    def create(self, validated_data):
        areas_data = validated_data.pop('areas')
        quotation = Quotation.objects.create(**validated_data)
        for area_data in areas_data:
            QuotationArea.objects.create(quotation=quotation, **area_data)
        return quotation
