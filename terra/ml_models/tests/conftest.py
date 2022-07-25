import pytest
from unittest import mock
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.base_user import AbstractBaseUser
from rest_framework.permissions import IsAuthenticated

from projects.permissions import HasUserAPIKey, IsModelPublic, IsOwnerOrReadOnly


@pytest.fixture(scope="session", autouse=True)
def mock_views_permissions():

    patch_perm = lambda perm: mock.patch.multiple(
        perm,
        has_permission=mock.Mock(return_value=True),
        has_object_permission=mock.Mock(return_value=True),
    )
    with ( 
        patch_perm(IsAuthenticated),
        patch_perm(HasUserAPIKey),
        patch_perm(IsOwnerOrReadOnly),
        patch_perm(IsModelPublic),
    ):
        yield