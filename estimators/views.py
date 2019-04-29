from rest_framework import permissions, viewsets

from projects.mixins import ProjectRelatedModelListMixin
from projects.permissions import HasAccessToRelatedProjectPermission

from .models import Estimator
from .serializers import EstimatorSerializer


class EstimatorViewSet(ProjectRelatedModelListMixin, viewsets.ModelViewSet):
    queryset = Estimator.objects.all().order_by('-created_at')
    serializer_class = EstimatorSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)
    lookup_field = 'uuid'
