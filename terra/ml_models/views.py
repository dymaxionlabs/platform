from rest_framework import permissions, views, viewsets
from ml_models.models import MLModel
from ml_models.serializers import MLModelSerializer
from projects.permissions import HasUserAPIKey

# Create your views here.
class MLModelViewSet(viewsets.ModelViewSet):
    queryset = MLModel.objects.all().order_by('-created_at')
    serializer_class = MLModelSerializer
    permission_classes = [HasUserAPIKey | permissions.IsAuthenticated]