from django.conf.urls import url
from django.urls import include
from rest_framework.routers import SimpleRouter

from . import views


urlpatterns = [
    url(r'^usage/?', views.UserQuotaUsageView.as_view()),
    url(r'^', views.UserQuotaView.as_view()),
]
