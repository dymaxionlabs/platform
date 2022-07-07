from django.db.models import Q
from rest_framework import permissions, views, viewsets
from ml_models.models import MLModel
from ml_models.serializers import MLModelSerializer
from projects.permissions import HasUserAPIKey, IsModelPublic, IsOwnerOrReadOnly

# Create your views here.
class MLModelViewSet(viewsets.ModelViewSet):
    queryset = MLModel.objects.all()
    serializer_class = MLModelSerializer
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated, IsOwnerOrReadOnly, IsModelPublic]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(Q(is_public=True) | Q(owner=self.request.user))
            .order_by("-created_at")
        )