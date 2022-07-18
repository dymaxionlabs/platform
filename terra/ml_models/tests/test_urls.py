import pytest
from django.urls import resolve, reverse


class TestMLModelViewSetURLs:
    @pytest.mark.parametrize('incoming_path, viewname',[
        ('/users/lucas/models/test_model/versions/latest/',         'MLModelVersionViewSet'),
        ('/users/lucas/models/test_model/versions/latest/predict/', 'MLModelVersionViewSet'),
    ])
    def test_url_name(self, incoming_path, viewname):
        resolver = resolve(incoming_path)
        assert resolver.func.__name__ == viewname