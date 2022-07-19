from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, views, viewsets, status
from ml_models.models import MLModel, MLModelVersion
from ml_models.serializers import MLModelSerializer, MLModelVersionSerializer
from projects.permissions import HasUserAPIKey, IsModelPublic, IsModelVersionModelPublic, IsOwnerOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from tasks.serializers import TaskSerializer

from tasks.utils import enqueue_task


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
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated, IsOwnerOrReadOnly, IsModelVersionModelPublic]
    lookup_field = "name"

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(
                Q(model__is_public=True) | Q(model__owner=self.request.user),
                model__name=self.kwargs['model_name'],
            )
            .order_by("-created_at")
        )

    def retrieve(self, request, *args, **kwargs):
        user_username, model_name, model_version_name = list(self.kwargs.values())
        base_filter = {
            'model__owner__username': user_username,
            'model__name': model_name,
        }
        if model_version_name == 'latest':
            version_filter = {}
        else:
            version_filter = {'name': model_version_name}
        qs = MLModelVersion.objects.filter(
            **(base_filter | version_filter)
        ).order_by('-created_at')
        ml_model_version = get_object_or_404(qs)
        serializer = MLModelVersionSerializer(ml_model_version)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'], name='Predict model', permission_classes=[HasUserAPIKey | permissions.IsAuthenticated, IsOwnerOrReadOnly, IsModelVersionModelPublic])
    def predict(self, *args, **kwargs):
        user_username, model_name, model_version_name = list(self.kwargs.values())
        ml_model_version_filter = {
            'model__name': model_name,
            'model__owner__username': user_username,
        } | {} if model_version_name == 'latest' else {'name': model_version_name}
        user_params = self.request.POST
        qs = MLModelVersion.objects.filter(**ml_model_version_filter).order_by('-created_at')
        ml_model_version = get_object_or_404(qs)
        task = enqueue_task(
            'predict',
            ml_model_version_id=ml_model_version.id,
            project_id=self.request.project.id,
            **user_params
        )
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
