from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ParseError
from projects.permissions import HasBetaAccess, HasUserAPIKey
from ml_models.permissions import (
    IsOwnerOrPublicReadOnly,
    IsModelOwnerOrPublicReadOnly,
    IsModelVersionPublic,
    IsModelOwner,
)
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from tasks.serializers import TaskSerializer
from tasks.utils import enqueue_task
from projects.models import Project

from .utils.constants import PREDICT_TASK
from .models import MLModel, MLModelVersion
from .serializers import MLModelSerializer, MLModelVersionSerializer


class AllMLModelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [
        HasUserAPIKey | permissions.IsAuthenticated,
        IsOwnerOrPublicReadOnly,
    ]
    lookup_field = "name"
    pagination_class = PageNumberPagination

    def get_queryset(self):
        base_qs = super().get_queryset().order_by("-created_at")
        all_public_qs = base_qs.filter(is_public=True)
        user_qs = base_qs.filter(owner=self.request.user)
        return all_public_qs.union(user_qs)


class MLModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [
        HasUserAPIKey | permissions.IsAuthenticated,
        IsOwnerOrPublicReadOnly,
    ]
    lookup_field = "name"

    def get_queryset(self):
        username = self.kwargs["user_username"]
        base_qs = super().get_queryset().filter(owner__username=username)
        if self.request.user.username != username:
            return base_qs.filter(is_public=True)
        return base_qs


class MLModelVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MLModelVersion.objects.all()
    serializer_class = MLModelVersionSerializer
    permission_classes = [
        HasUserAPIKey | permissions.IsAuthenticated,
        IsModelOwnerOrPublicReadOnly,
    ]
    lookup_field = "name"
    lookup_value_regex = "[^/]+"

    def get_queryset(self):
        username = self.kwargs["user_username"]
        modelname = self.kwargs["model_name"]
        base_qs = (
            super()
            .get_queryset()
            .filter(model__name=modelname)
            .filter(model__owner__username=username)
            .order_by("-created_at")
        )
        if self.request.user.username != username:
            return base_qs.filter(model__is_public=True)
        return base_qs

    def retrieve(self, request, *args, **kwargs):
        user_username, model_name, model_version_name = list(self.kwargs.values())
        base_filter = {
            "model__owner__username": user_username,
            "model__name": model_name,
            "name": model_version_name,
        }
        qs = MLModelVersion.objects.filter(**base_filter)
        ml_model_version = get_object_or_404(qs)
        serializer = MLModelVersionSerializer(ml_model_version)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["POST"],
        name="Predict model",
        permission_classes=[
            HasUserAPIKey | permissions.IsAuthenticated,
            IsModelOwner | IsModelVersionPublic,
            HasBetaAccess
        ],
    )
    def predict(self, *args, **kwargs):
        user_username, model_name, model_version_name = list(self.kwargs.values())
        base_filter = {
            "model__owner__username": user_username,
            "model__name": model_name,
            "name": model_version_name,
        }
        user_params = self.request.data.get("parameters", {})
        project_uuid = self.request.project if hasattr(self.request, 'project') else None
        project_uuid = self.request.data.get("project")
        if not project_uuid:
            raise ParseError("When using tokens, you need to specify `project`")
        project = Project.objects.get(uuid=project_uuid)
        qs = MLModelVersion.objects.filter(**base_filter)
        ml_model_version = get_object_or_404(qs)
        task = enqueue_task(
            PREDICT_TASK,
            ml_model_version_id=ml_model_version.id,
            project_id=project.id,
            user_params=user_params,
        )
        serializer = TaskSerializer(task)
        return Response(serializer.data)
