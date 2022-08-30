from unittest import mock

import pytest
from ml_models.permissions import IsModelPublic, IsOwnerOrReadOnly
from projects.permissions import HasUserAPIKey
from rest_framework.permissions import IsAuthenticated


def pytest_collection_modifyitems(items):
    """
    Marks all tests in this dir with the `unit` marker.
    """
    for item in items:
        item.add_marker("unit")


@pytest.fixture(autouse=True, scope="session")
def _shut_logger(session_mocker):
    with session_mocker.patch("ml_models.tasks.logger"):
        yield


@pytest.fixture(scope="function")
def _mock_views_permissions():

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
