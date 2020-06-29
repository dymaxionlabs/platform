from django.shortcuts import render
from django.utils.translation import gettext as _
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from terra.payments import MP_CLIENT

from .models import Request, RequestStateUpdate
from .serializers import RequestSerializer

REQUEST_ITEM_TITLE = _('Analytics service')


class RequestViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                     viewsets.GenericViewSet):
    serializer_class = RequestSerializer
    queryset = Request.objects.all()
    permission_classes = (permissions.AllowAny, )

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset.all()
        elif not user.is_anonymous:
            return self.queryset.filter(user=user).all()
        else:
            return self.queryset.none()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_staff or instance.user.id == request.user.id:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

    def perform_create(self, serializer):
        # If there is an authenticated user, assign it to `user` field
        user = self.request.user
        user = user if not user.is_anonymous else None

        data = serializer.validated_data
        if not user and (not data.get('name') or not data.get('email')):
            raise ValidationError(
                "name and email must be present if user is blank")

        instance = serializer.save(user=user)

        # If not requesting a specific project_uuid, include *all* public maps
        only_request = self.request.query_params.get('only_request', None)
        if not only_request:
            self._create_payment(instance)

    def _create_payment(self, obj):
        if obj.total_area == 0:
            return
        layers_sentence = ", ".join(obj.layers or [])
        area_km2 = "{} km²".format(round(obj.total_area))
        title = '{title}: {layers} (area: {area})'.format(
            title=REQUEST_ITEM_TITLE, layers=layers_sentence, area=area_km2)
        preference = MP_CLIENT.create_preference(
            title=title, unit_price=obj.price_usd)
        obj.payment_id = preference['id']
        obj.extra_fields['payment_init_point'] = preference['init_point']
        obj.extra_fields['payment_sandbox_init_point'] = preference[
            'sandbox_init_point']
        obj.save()
        obj.update_state(
            RequestStateUpdate.AWAITING_PAYMENT_STATE,
            extra_fields=dict(preference=preference))
