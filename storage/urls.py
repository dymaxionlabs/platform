from django.conf.urls import url

from storage.views import ListFile, UploadFile, FileView, FileDownloadView, CreateResumableUpload, ResumableUpload

urlpatterns = [
    url(r'^files/?$', ListFile.as_view(), name='index'),
    url(r'^file/?$', FileView.as_view()),
    url(r'^upload/?$', UploadFile.as_view(), name='upload'),
    url(r'^download/?$', FileDownloadView.as_view(), name='download'),
    url(r'^create-resumable-upload/?$',
        CreateResumableUpload.as_view(),
        name='create-resumable-upload'),
    url(r'^resumable-upload/?$',
        ResumableUpload.as_view(),
        name='resumable-upload')
]
