from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    """
    Custom permission for user viewset

    * Only staff can: list, destroy
    * Only same user can: retrieve, update, partial_update
    * Anyone can: create

    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user
