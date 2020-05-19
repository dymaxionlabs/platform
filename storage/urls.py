from django.conf.urls import url

from storage.views import ListFile, UploadFile, FileView, FileDownloadView

urlpatterns = [
    url(r'^files/?$', ListFile.as_view(), name='index'),
    url(r'^file/?$', FileView.as_view(), name='retrieve'),
    url(r'^upload/?$', UploadFile.as_view(), name='upload'),
    url(r'^download/?$', FileDownloadView.as_view(), name='download')
]
