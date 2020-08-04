from django.conf.urls import url
from django.urls import include
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register(r'', views.TaskViewSet)

urlpatterns = [
    url(r'^(?P<id>[^/]+)/list-artifacts/?',
        views.ListArtifactsAPIView.as_view()),
    url(r'^(?P<id>[^/]+)/export-artifacts/?',
        views.ExportArtifactsAPIView.as_view()),
    url(r'^(?P<id>[^/]+)/download-artifacts/?',
        views.DownloadArtifactsAPIView.as_view()),
    url(r'^(?P<id>[^/]+)/cancel/?',
        views.CancelTaskAPIView.as_view()),
    url(r'^', include(router.urls)),
]
