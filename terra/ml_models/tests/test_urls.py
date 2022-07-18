import pytest
from django.urls import resolve, reverse


class TestMLModelViewSetURLs:
    @pytest.mark.parametrize('incoming_path, viewname',[
        ('/users/lucas/models/',                                    'UserMLModelViewSet'),
        ('/users/lucas/models/test_model/',                         'UserMLModelViewSet'),
        ('/users/lucas/models/test_model/versions/',                'MLModelVersionViewSet'),
        ('/users/lucas/models/test_model/versions/latest/',         'MLModelVersionViewSet'),
        ('/users/lucas/models/test_model/versions/latest/predict/', 'MLModelVersionViewSet'),
    ])
    def test_url_name(self, incoming_path, viewname):
        resolver = resolve(incoming_path)
        assert resolver.func.__name__ == viewname