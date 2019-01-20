from django.shortcuts import render
from rest_framework import mixins, viewsets, permissions

from .models import Quotation
from .serializers import QuotationSerializer


class CreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    A viewset that provides `retrieve`, `create`, and `list` actions.

    To use it, override the class and set the `.queryset` and
    `.serializer_class` attributes.
    """
    pass


class QuotationViewSet(CreateViewSet):
    serializer_class = QuotationSerializer
    queryset = Quotation.objects.all()
    permission_classes = (permissions.AllowAny, )
