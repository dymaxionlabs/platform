from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^files/?$', views.ListFile.as_view()),
    url(r'^file/?$', views.FileView.as_view()),
    url(r'^upload/?$', views.UploadFile.as_view()),
    url(r'^download/?$', views.FileDownloadView.as_view()),
    url(r'^create-resumable-upload/?$', views.CreateResumableUpload.as_view())
]
