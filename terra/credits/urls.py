from django.conf.urls import url
from django.urls import include
from rest_framework import views
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register(r'log', views.LogEntryViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^available/?$', views.AvailableCreditsView.as_view()),
]
