from django.conf.urls import url
from storage.views import ListFile

urlpatterns = [
    url(r'^files/?', ListFile.as_view(), name='index'),
]
