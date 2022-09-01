import pytest
from ml_models.models import MLModel
from ml_models.serializers import MLModelSerializer
from model_bakery import baker

baker.generators.add("mdeditor.fields.MDTextField", lambda: "description")

class TestMLModelSerializer:

    ml_model = baker.prepare(MLModel)

    def test_serialize(self):
        serializer = MLModelSerializer(self.ml_model)

        assert serializer.data

    def test_deserialize(self):
        ml_model_fields = [field.name for field in MLModel._meta.get_fields()]
        valid_serialized_data = {k: v for (k, v) in self.ml_model.__dict__.items() if k in ml_model_fields}

        serializer = MLModelSerializer(data=valid_serialized_data)

        assert serializer.is_valid()
        assert serializer.errors == {}

    ml_model_name_max_chars = 134

    @pytest.mark.parametrize(
        "wrong_field",
        (
            {"name": "a" * (ml_model_name_max_chars + 1)},
            {"tags": "tag outside of array"},
            {"tags": ["--------wrong length tag--------"]},
            {"is_public": "Nope"},
        ),
    )
    def test_deserialize_fails(self, wrong_field: dict):
        ml_model_fields = [field.name for field in MLModel._meta.get_fields()]
        invalid_serialized_data = {
            k: v for (k, v) in self.ml_model.__dict__.items() if k in ml_model_fields and k != "id"
        } | wrong_field

        serializer = MLModelSerializer(data=invalid_serialized_data)

        assert not serializer.is_valid()
        assert serializer.errors != {}
