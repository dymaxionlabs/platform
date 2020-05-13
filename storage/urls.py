from django.conf.urls import url

from storage.views import ListFile, UploadFile, RetrieveFile

urlpatterns = [
    url(r'^files/?$', ListFile.as_view(), name='index'),
    url(r'^file/?$', RetrieveFile.as_view(), name='retrieve'),
    url(r'^upload/?$', UploadFile.as_view(), name='upload')
]
