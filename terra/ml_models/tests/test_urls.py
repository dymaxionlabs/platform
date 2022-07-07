import pytest
from django.urls import resolve, reverse


class TestMLModelViewSetURLs:
    @pytest.mark.parametrize('url_name, expected_path, kwargs, viewname',[
        ('model',   '/api/model/',      None,       'MLModelViewSet'),
        ('model', '/api/model/1/',    {'pk': 1},  'MLModelViewSet'),
    ])
    def test_url_name(self, url_name, expected_path, kwargs, viewname):
        url = reverse(url_name, kwargs=kwargs)
        assert url == expected_path

        resolver = resolve(expected_path)
        assert resolver.func.__name__ == viewname