from html import escape

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import serializers
from mailchimp3 import MailChimp
import os 

from terra.settings import DEFAULT_FROM_EMAIL

from .models import File, Layer, Map, MapLayer, Project, ProjectInvitationToken

# ids mailchimp lists
AUDIENCE_ID_AGRO = '73d5a1e868'
AUDIENCE_ID_URBAN= '69a9ec43f4'


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
    name = serializers.CharField(required=False, default='')
    email = serializers.EmailField()
    message = serializers.CharField()
    landing = serializers.CharField(required=False, default='')

    def save(self):
        from_email = DEFAULT_FROM_EMAIL
        recipients = ['contact@dymaxionlabs.com', 'gessica@dymaxionlabs.com']
        client = MailChimp(DIR_API = os.path.join(MC_API), DIR_USER = os.path.join(MC_USER))
        data = client.lists.all(get_all=True)
        landing = self.data['landing']
        email = self.data['email']
        name = self.data['name'].split(" ")

        status = client.lists.members.create(audience_id, {        
                'email_address': email,
                'status': 'subscribed',
                'merge_fields': {
                    'FNAME': name[0],
                    'LNAME': name[1]}}),      

        try:
            if landing == "Urbano":
                audience_id = AUDIENCE_ID_URBAN
                status
               
            elif landing == "Agro":
                audience_id = AUDIENCE_ID_AGRO
                status
        except Exception as e:
            print("Error al cargar el mensaje: {}".format(str(e)))
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
        landing = self.data['landing']
        resp = "Consulta\n\n" \
            "Landing: {landing}\n"\
            "Email: {email}\n" \
            "Mensaje: {message}\n".format(email=email, message=message, landing=landing)
        return resp
    def html_body(self):
        email, message = self.data['email'], self.data['message']
        return "<h3>Consulta</h3>" \
            "<b>Email:</b> {email}<br />" \
            "<b>Mensaje:</b> {message}<br />".format(
                email=escape(email),
                message=escape(message))


class ProjectInvitationTokenSerializer(serializers.ModelSerializer):
    project = serializers.SlugRelatedField(read_only=True, slug_field='name')

    class Meta:
        model = ProjectInvitationToken
        fields = ('key', 'project', 'email', 'confirmed', 'created_at',
                  'updated_at')


class ProjectSerializer(serializers.ModelSerializer):
    owners = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='username')

    class Meta:
        model = Project
        exclude = ('id', 'groups')

    def create(self, validated_data):
        validated_data['owners'] = [self.context['request'].user]
        return super().create(validated_data)


class LayerSerializer(serializers.ModelSerializer):
    tiles_url = serializers.ReadOnlyField()
    extent = serializers.ReadOnlyField()

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
    extent = serializers.ReadOnlyField()

    class Meta:
        model = Map
        exclude = ('id', )


class FileSerializer(serializers.ModelSerializer):
    project = serializers.SlugRelatedField(slug_field='uuid', read_only=True)
    file = serializers.FileField(use_url=True, read_only=True)
    metadata = serializers.JSONField()

    class Meta:
        model = File
        fields = ('project', 'name', 'metadata', 'file')
