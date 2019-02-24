from html import escape

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import serializers

from terra.settings import DEFAULT_FROM_EMAIL

from .models import Layer, Map, MapLayer, Project


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')


class LoginUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError(
            "Unable to log in with provided credentials.")


class ContactSerializer(serializers.Serializer):
    email = serializers.EmailField()
    message = serializers.CharField()

    def save(self):
        from_email = DEFAULT_FROM_EMAIL
        recipients = ['contact@dymaxionlabs.com']
        send_mail(
            self.subject(),
            self.body(),
            from_email,
            recipients,
            html_message=self.html_body())

    def subject(self):
        email = self.data['email']
        return "Consulta de {}".format(escape(email))

    def body(self):
        email, message = self.data['email'], self.data['message']
        return "Consulta\n\n" \
            "Email: {email}\n" \
            "Mensaje: {message}\n".format(email=email, message=message)

    def html_body(self):
        email, message = self.data['email'], self.data['message']
        return "<h3>Consulta</h3>" \
            "<b>Email:</b> {email}<br />" \
            "<b>Mensaje:</b> {message}<br />".format(
                email=escape(email),
                message=escape(message))


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        exclude = ('id', )


class LayerSerializer(serializers.ModelSerializer):
    tiles_url = serializers.ReadOnlyField()

    class Meta:
        model = Layer
        exclude = ('id', )


class MapLayerSerializer(serializers.ModelSerializer):
    layer = LayerSerializer(read_only=True)

    class Meta:
        model = MapLayer
        fields = ('layer', 'order', 'is_active')


class MapSerializer(serializers.ModelSerializer):
    layers = MapLayerSerializer(many=True, read_only=True)

    class Meta:
        model = Map
        exclude = ('id', )
