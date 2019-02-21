from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    """
    Custom permission for users

    * Allows staff
    * Allow only if same user

    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class MapPermission(permissions.BasePermission):
    """
    Custom permission for Maps

    * Allow any, but only for *public* maps
    * Allow staff or user who has access to associated Project

    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_anonymous:
            return not obj.is_private
        else:
            return request.user.is_staff or obj.project.groups.filter(
                user=request.user).exists()


class ProjectPermission(permissions.BasePermission):
    """
    Custom permission for Projects

    * Allow staff or user who has access to associated Project

    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.project.groups.filter(
            user=request.user).exists()
