import pytest
from django.urls import resolve, reverse


class TestMLModelURLs:
    
    @pytest.mark.parametrize(
        'url_path, viewname, url_kwargs, url_name',
        (
            ('/users/test_user/models/',                                            'UserMLModelViewSet',       {"user_username": "test_user"},                             'models-list'),
            ('/users/test_user/models/test_model/',                                 'UserMLModelViewSet',       {"user_username": "test_user", "name": "test_model"},                             'models-detail'),
            ('/users/test_user/models/test_model/versions/',                        'MLModelVersionViewSet',    {"user_username": "test_user", "model_name": "test_model"}, 'versions-list'),
            ('/users/test_user/models/test_model/versions/test_version/',           'MLModelVersionViewSet',    {"user_username": "test_user", "model_name": "test_model", "name": "test_version"}, 'versions-detail'),
            ('/users/test_user/models/test_model/versions/test_version/predict/',   'MLModelVersionViewSet',    {"user_username": "test_user", "model_name": "test_model", "name": "test_version"}, 'versions-predict'),
        )
    )
    def test_urls(self, url_path, viewname, url_kwargs, url_name):
        resolver = resolve(url_path)
        assert resolver.func.__name__ == viewname

        url = reverse(url_name, kwargs=url_kwargs)
        assert url == url_path
