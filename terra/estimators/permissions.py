from rest_framework import permissions

from projects.permissions import HasAccessToRelatedProjectPermission


class HasAccessToRelatedEstimatorPermission(HasAccessToRelatedProjectPermission
                                            ):
    """ Custom permission for models associated to an Estimator """

    def has_object_permission(self, request, view, obj):
        return super(request, view, obj.estimator)