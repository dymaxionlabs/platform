from html import escape

import rest_auth
import rest_auth.registration.serializers
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from mailchimp3 import MailChimp
from rest_framework import serializers

from terra.emails import EarlyAccessBetaEmail

from .models import (
    Dashboard,
    Layer,
    Map,
    MapLayer,
    Project,
    ProjectInvitationToken,
    UserAPIKey,
    UserProfile,
)


class UserProfileSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        exclude = ("id", "user", "created_at", "updated_at")


class UserDetailsSerializer(rest_auth.serializers.UserDetailsSerializer):
    profile = UserProfileSimpleSerializer(source="userprofile")

    class Meta(rest_auth.serializers.UserDetailsSerializer.Meta):
        fields = ("pk", "username", "email", "first_name", "last_name", "profile")


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name")


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.SlugRelatedField(
        read_only=True, source="user", slug_field="username"
    )

    class Meta:
        model = UserProfile
        exclude = ("id", "user", "created_at", "updated_at")


class LoginUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Unable to log in with provided credentials.")


class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, default="")
    email = serializers.EmailField()
    message = serializers.CharField()
    landing = serializers.CharField(required=False, default="")

    def save(self):
        from_email = settings.DEFAULT_FROM_EMAIL
        recipients = ["contact@dymaxionlabs.com"]

        if self._has_landing():
            self._create_mailchimp_audience()

        send_mail(
            self.subject(),
            self.body(),
            from_email,
            recipients,
            html_message=self.html_body(),
        )

    def subject(self):
        email = self.data["email"]
        return "Consulta de {}".format(escape(email))

    def body(self):
        email, message = self.data["email"], self.data["message"]
        landing = self.data["landing"]
        resp = (
            "Consulta\n\n"
            "Landing: {landing}\n"
            "Email: {email}\n"
            "Mensaje: {message}\n".format(email=email, message=message, landing=landing)
        )
        return resp

    def html_body(self):
        email, message = self.data["email"], self.data["message"]
        return (
            "<h3>Consulta</h3>"
            "<b>Email:</b> {email}<br />"
            "<b>Mensaje:</b> {message}<br />".format(
                email=escape(email), message=escape(message)
            )
        )

    def _has_landing(self):
        return self.data["landing"] != ""

    def _get_mailchimp_audience_id(self):
        landing = self.data["landing"]
        if landing == "Urbano":
            return settings.MAILCHIMP_AUDIENCE_IDS["urban"]
        elif landing == "Agro":
            return settings.MAILCHIMP_AUDIENCE_IDS["agri"]
        else:
            raise RuntimeError(f"Invalid landing: {landing}")

    def _create_mailchimp_audience(self):
        email = self.data["email"]
        name = self.data["name"].split(" ")
        try:
            audience_id = self._get_mailchimp_audience_id()

            client = MailChimp(
                mc_api=settings.MAILCHIMP_APIKEY, mc_user=settings.MAILCHIMP_USER
            )

            return client.lists.members.create(
                audience_id,
                {
                    "email_address": email,
                    "status": "subscribed",
                    "merge_fields": {"FNAME": name[0], "LNAME": name[1]},
                },
            )
        except Exception as e:
            print("Failed to create audience:", str(e))


class SubscribeBetaSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        email = EarlyAccessBetaEmail(recipients=[self.data["email"]])
        email.send_mail()


class ProjectInvitationTokenSerializer(serializers.ModelSerializer):
    project = serializers.SlugRelatedField(read_only=True, slug_field="name")

    class Meta:
        model = ProjectInvitationToken
        fields = ("key", "project", "email", "confirmed", "created_at", "updated_at")


class ProjectSerializer(serializers.ModelSerializer):
    collaborators = serializers.SlugRelatedField(
        many=True, slug_field="username", queryset=User.objects.all()
    )

    class Meta:
        model = Project
        exclude = ("id", "groups")
        extra_kwargs = {"owner": {"read_only": True}}


class LayerSerializer(serializers.ModelSerializer):
    tiles_url = serializers.ReadOnlyField()
    extent = serializers.ReadOnlyField()

    class Meta:
        model = Layer
        exclude = ("id",)


class MapLayerSerializer(serializers.ModelSerializer):
    layer = LayerSerializer(read_only=True)

    class Meta:
        model = MapLayer
        fields = ("layer", "order", "is_active")


class MapSerializer(serializers.ModelSerializer):
    layers = MapLayerSerializer(many=True, read_only=True)
    extent = serializers.ReadOnlyField()

    class Meta:
        model = Map
        exclude = ("id",)


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = "__all__"


class UserAPIKeySerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field="username", read_only=True)
    project = serializers.SlugRelatedField(slug_field="uuid", read_only=True)

    class Meta:
        model = UserAPIKey
        fields = ("prefix", "created", "name", "user", "project", "revoked")
        lookup_field = "id"


class UserRegistrationSerializer(rest_auth.registration.serializers.RegisterSerializer):
    def get_cleaned_data(self):
        clean_username = self.validated_data.get("username", "").lower()
        return {
            "username": clean_username,
            "password1": self.validated_data.get("password1", ""),
            "email": self.validated_data.get("email", ""),
        }
