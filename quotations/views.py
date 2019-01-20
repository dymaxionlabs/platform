from django.shortcuts import render
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response

from .models import Quotation
from .serializers import QuotationSerializer


class CreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    A viewset that provides `create`.

    To use it, override the class and set the `.queryset` and
    `.serializer_class` attributes.
    """
    pass


class QuotationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = QuotationSerializer
    queryset = Quotation.objects.all()
    permission_classes = (permissions.AllowAny, )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_staff or instance.user.id == request.user.id:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)