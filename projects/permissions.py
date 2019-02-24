from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    """
    Custom permission for users

    * Allows staff
    * Allow only if same user

    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class ProjectAssociationPermission(permissions.BasePermission):
    """
    Custom permission for models associated to a Project (Maps, Layers, etc.)

    * Allow staff or user who has access to associated Project

    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        return user.is_staff or obj.project.groups.filter(user=user).exists()


class ProjectPermission(permissions.BasePermission):
    """
    Custom permission for Projects

    * Allow staff or user who has access to associated Project

    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        return user.is_staff or obj.groups.filter(user=user).exists()