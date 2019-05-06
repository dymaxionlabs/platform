from rest_framework import permissions, viewsets

from projects.mixins import ProjectRelatedModelListMixin
from projects.permissions import HasAccessToRelatedProjectPermission

from .models import Estimator, ImageTile
from .serializers import EstimatorSerializer, ImageTileSerializer


class EstimatorViewSet(ProjectRelatedModelListMixin, viewsets.ModelViewSet):
    queryset = Estimator.objects.all().order_by('-created_at')
    serializer_class = EstimatorSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)
    lookup_field = 'uuid'


class ImageTileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImageTile.objects.all().order_by('index')
    serializer_class = ImageTileSerializer
    permission_classes = (permissions.IsAuthenticated,
                          HasAccessToRelatedProjectPermission)

    def get_queryset(self):
        queryset = self.queryset
        files = [
            f for f in self.request.query_params.get('files', '').split(',')
            if f
        ]
        if files:
            queryset = queryset.filter(file__name__in=files)
        return queryset