import pytest
from model_bakery import baker

from ml_models.serializers import MLModelSerializer, MLModelVersionSerializer
from ml_models.models import MLModel, MLModelVersion


class TestMLModelSerializer:

    ml_model = baker.prepare(MLModel)

    def test_serialize(self):
        serializer = MLModelSerializer(self.ml_model)

        assert serializer.data

    def test_deserialize(self):
        valid_serialized_data = {
            k: v
            for (k, v) in self.ml_model.__dict__.items()
            if k not in MLModelSerializer.Meta.exclude
        }

        serializer = MLModelSerializer(data=valid_serialized_data)

        assert serializer.is_valid()
        assert serializer.errors == {}

    ml_model_name_max_chars = 134

    @pytest.mark.parametrize(
        "wrong_field",
        (
            {"name": "a" * (ml_model_name_max_chars + 1)},
            {"tags": "tag-outside-of-array"},
            {"repo_url": "wron_format_url"},
            {"tags": ["--------wrong length tag--------"]},
            {"is_public": "Nope"},
        ),
    )
    def test_deserialize_fails(self, wrong_field: dict):
        invalid_serialized_data = {
            k: v
            for (k, v) in self.ml_model.__dict__.items()
            if k not in MLModelSerializer.Meta.exclude
        } | wrong_field

        serializer = MLModelSerializer(data=invalid_serialized_data)

        assert not serializer.is_valid()
        assert serializer.errors != {}


class TestMLModelVersionSerializer:
    ml_model_version = baker.prepare(MLModelVersion)

    def test_serialize(self):
        serializer = MLModelVersionSerializer(self.ml_model_version)

        assert serializer.data

    def test_deserialize(self):
        valid_serialized_data = {
            k: v
            for (k, v) in self.ml_model_version.__dict__.items()
            if k not in MLModelVersionSerializer.Meta.exclude
        }

        serializer = MLModelVersionSerializer(data=valid_serialized_data)

        assert serializer.is_valid()
        assert serializer.errors == {}

    ml_model_version_name_max_chars = 100