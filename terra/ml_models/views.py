from django.db.models import Q
from rest_framework import permissions, views, viewsets
from ml_models.models import MLModel, MLModelVersion
from ml_models.serializers import MLModelSerializer, MLModelVersionSerializer
from projects.permissions import HasUserAPIKey, IsModelPublic, IsOwnerOrReadOnly


class MLModelViewSet(viewsets.ModelViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated, IsOwnerOrReadOnly, IsModelPublic]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(Q(is_public=True) | Q(owner=self.request.user))
            .order_by("-created_at")
        )


class UserMLModelViewSet(MLModelViewSet):
    lookup_field = "name"

    def get_queryset(self):
        return super().get_queryset().filter(owner__username=self.kwargs['username'])


class MLModelVersionViewSet(viewsets.ModelViewSet):
    queryset = MLModelVersion.objects.all()
    serializer_class = MLModelVersionSerializer
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated, IsOwnerOrReadOnly, IsModelPublic]
    lookup_field = "name"

    def get_queryset(self):
        print(self.kwargs)
        return (
            super()
            .get_queryset()
            .filter(
                Q(model__is_public=True) | Q(model__owner=self.request.user),
                model__name=self.kwargs['model_name'],
            )
            .order_by("-created_at")
        )