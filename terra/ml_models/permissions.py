from rest_framework import permissions

from ml_models.models import MLModel, MLModelVersion


class IsOwnerOrPublicReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.owner or (obj.is_public and request.method in permissions.SAFE_METHODS)


class IsModelOwnerOrPublicReadOnly(permissions.BasePermission):
    model = MLModelVersion

    def has_object_permission(self, request, view, obj):
        return request.user == obj.owner or (obj.model.is_public and request.method in permissions.SAFE_METHODS)


class IsModelOwner(permissions.BasePermission):
    model = MLModelVersion

    def has_object_permission(self, request, view, obj):
        return request.user == obj.model.owner

class IsModelVersionPublic(permissions.BasePermission):
    model = MLModelVersion

    def has_object_permission(self, request, view, obj):
        return obj.model.is_public

