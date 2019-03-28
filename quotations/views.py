from django.shortcuts import render
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response

from .models import Request
from .serializers import RequestSerializer


class RequestViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                     viewsets.GenericViewSet):
    serializer_class = RequestSerializer
    queryset = Request.objects.all()
    permission_classes = (permissions.AllowAny, )

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset.all()
        elif not user.is_anonymous:
            return self.queryset.filter(user=user).all()
        else:
            return self.queryset.none()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_staff or instance.user.id == request.user.id:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
