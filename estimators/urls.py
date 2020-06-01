from django.conf.urls import url
from django.urls import include
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register(r'', views.EstimatorViewSet)
router.register(r'annotations', views.AnnotationViewSet)
router.register(r'image_tiles', views.ImageTileViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^(?P<uuid>[^/]+)/segments_per_label/?',
        views.SegmentsPerLabelView.as_view()),
    url(r'^(?P<uuid>[^/]+)/train/?', views.StartTrainingJobView.as_view()),
    url(r'^(?P<uuid>[^/]+)/predict/?', views.StartPredictionJobView.as_view()),
    url(r'^(?P<uuid>[^/]+)/load_labels/?', views.AnnotationUpload.as_view()),
    url(r'^start_tailing_job/?', views.StartImageTilingJobView.as_view()),
]
