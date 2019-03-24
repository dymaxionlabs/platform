from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    """
    Custom permission for users

    * Allows staff
    * Allow only if same user

    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class HasAccessToRelatedProjectPermission(permissions.BasePermission):
    """
    Custom permission for models associated to a Project (Maps, Layers, etc.)

    * Allow staff or user who has access to associated Project

    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        user_is_project_owner = user in obj.project.owners.all()
        user_can_view_project = user.has_perm('view_project', obj.project)
        user_belongs_to_some_project_group = obj.project.groups.filter(
            user=user).exists()  # deprecated
        return user.is_staff or user_is_project_owner or user_can_view_project or user_belongs_to_some_project_group


class HasAccessToRelatedProjectFilesPermission(
        HasAccessToRelatedProjectPermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or super().has_object_permission(
            request, view, obj)


class HasAccessToProjectPermission(permissions.BasePermission):
    """
    Custom permission for Projects

    * Allow staff or user who has access to associated Project

    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        user_is_owner = user in obj.owners.all()
        user_can_view_project = user.has_perm('view_project', obj)
        user_belongs_to_some_group = obj.groups.filter(
            user=user).exists()  # deprecated
        return user.is_staff or user_is_owner or user_can_view_project or user_belongs_to_some_group
