from django.conf.urls import url

from storage.views import ListFile, UploadFile

urlpatterns = [
    url(r'^files/?', ListFile.as_view(), name='index'),
    url(r'^upload/(?P<filename>.+)$', UploadFile.as_view(), name='upload'),
]
