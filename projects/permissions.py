from rest_framework import permissions


class IsAdminOrSameUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users or the "owner" of an object to access it.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.id == request.user.id