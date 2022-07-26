import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model

from ml_models.permissions import IsOwnerOrReadOnly


class TestIsOwnerOrReadOnly:
    def test_safe_method(self, rf):

        # Arrange
        request = rf.get("/")

        # Act
        perm_check = IsOwnerOrReadOnly()

        # Assert
        assert perm_check.has_object_permission(request, None, None)

    def test_user_is_owner_unsafe_method(self, rf):

        # Arrange
        request = rf.post("/")
        request_user = baker.prepare(get_user_model())
        request.user = request_user
        obj = type("TestObj", (object,), {"owner": request_user})

        # Act
        perm_check = IsOwnerOrReadOnly()

        # Assert
        assert perm_check.has_object_permission(request, None, obj)

    def test_user_not_owner_unsafe_method(self, rf):

        # Arrange
        request = rf.post("/")
        request_user, obj_owner = baker.prepare(get_user_model(), _quantity=2)
        request.user = request_user
        obj = type("TestObj", (object,), {"owner": 1})

        # Act
        perm_check = IsOwnerOrReadOnly()

        # Assert
        assert not perm_check.has_object_permission(request, None, obj)


class TestIsModelPublic:
    def test_is_public(self):
        pass

    def test_is_not_public(self):
        pass


class TestIsModelVersionPublic:
    def test_is_public(self):
        pass

    def test_is_not_public(self):
        pass
