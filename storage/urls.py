from django.conf.urls import url
from storage.views import List

urlpatterns = [
    url('', List.as_view(), name='index'),
]