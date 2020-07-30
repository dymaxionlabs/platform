from rest_framework import permissions
from rest_framework_api_key.permissions import BaseHasAPIKey

from .models import UserAPIKey


class UserPermission(permissions.BasePermission):
    """
    Custom permission for users

    * Allows staff
    * Allow only if same user

    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class UserProfilePermission(permissions.BasePermission):
    """
    Custom permission for user profiles

    * Allows staff
    * Allow only if from same user

    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user == request.user


class HasAccessToRelatedProjectPermission(permissions.BasePermission):
    """
    Custom permission for models associated to a Project (Maps, Layers, etc.)

    * Allow staff or user who has access to associated Project

    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        user_is_project_owner = user in obj.project.collaborators.all()
        user_can_view_project = user.has_perm('view_project', obj.project)
        user_belongs_to_some_project_group = obj.project.groups.filter(
            user=user).exists()  # deprecated
        return user.is_staff or user_is_project_owner or user_can_view_project or user_belongs_to_some_project_group


class HasAccessToRelatedProjectFilesPermission(
        HasAccessToRelatedProjectPermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or super().has_object_permission(
            request, view, obj)


class HasAccessToMapPermission(HasAccessToRelatedProjectPermission):
    def has_object_permission(self, request, view, obj):
        """Same as super(), but check first if map is public"""
        is_public_map = obj.extra_fields and obj.extra_fields.get(
            'public', False)
        return is_public_map or super().has_object_permission(
            request, view, obj)


class HasAccessToProjectPermission(permissions.BasePermission):
    """
    Custom permission for Projects

    * Allow staff or user who has access to associated Project

    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        user_is_owner = user in obj.collaborators.all()
        user_can_view_project = user.has_perm('view_project', obj)
        user_belongs_to_some_group = obj.groups.filter(
            user=user).exists()  # deprecated
        return user.is_staff or user_is_owner or user_can_view_project or user_belongs_to_some_group


class HasUserAPIKey(BaseHasAPIKey):
    model = UserAPIKey

    def has_permission(self, request, view):
        key = self.get_key(request)
        if not key:
            return False
        is_valid = self.model.objects.is_valid(key)
        if is_valid:
            prefix, _, _ = key.partition(".")
            instance = self.model.objects.get(prefix=prefix)
            request.user = instance.user
            request.project = instance.project
            # Also set on body, if not present
            if 'project' not in request.data:
                # Sometimes request.data is a QueryDict and we have to make it mutable
                if hasattr(request.data, '_mutable'):
                    request.data._mutable = True
                request.data['project'] = instance.project.uuid
        return is_valid


class HasAccessToAPIKeyPermission(permissions.BasePermission):
    model = UserAPIKey

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
