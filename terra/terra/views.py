from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


@api_view(["GET", "HEAD"])
@permission_classes([AllowAny])
def index(request):
    return Response(status=204)
