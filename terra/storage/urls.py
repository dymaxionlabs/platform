from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^files/?$', views.ListFilesView.as_view()),
    url(r'^file/?$', views.FileView.as_view()),
    url(r'^upload/?$', views.UploadFileView.as_view()),
    url(r'^download/?$', views.DownloadFileView.as_view()),
    url(r'^create-resumable-upload/?$',
        views.CreateResumableUploadView.as_view())
]
