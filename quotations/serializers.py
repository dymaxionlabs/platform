from rest_framework import serializers
from .models import Quotation


class QuotationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Quotation
        fields = '__all__'