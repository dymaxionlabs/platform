from rest_framework import permissions

from ml_models.models import MLModel, MLModelVersion


class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            return obj.owner == request.user

class IsModelPublic(permissions.BasePermission):

    model = MLModel

    def has_object_permission(self, request, view, obj):
        return obj.is_public

class IsModelVersionModelPublic(permissions.BasePermission):

    model = MLModelVersion

    def has_object_permission(self, request, view, obj):
        return obj.model.is_public