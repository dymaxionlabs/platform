from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.translation import gettext as _


class Request(models.Model):
    user = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)
    layers = ArrayField(models.CharField(max_length=30), null=True, blank=True)
    extra_fields = JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def state(self):
        last_state_update = self.last_state_update()
        if last_state_update:
            return last_state_update.state
        else:
            return RequestStateUpdate.PENDING_STATE

    def last_state_update(self):
        return self.state_updates.last()

    def __str__(self):
        layers_sentence = ', '.join(self.layers)
        return 'Request from {} for layers: {}'.format(self.name,
                                                       layers_sentence)


class RequestArea(models.Model):
    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name='areas')
    area_geom = models.PolygonField()

    def area_km2(self):
        geom = self.area_geom
        geom.transform(32721)
        return geom.area / 10000

    def __str__(self):
        return "Area of {} km²".format(round(self.area_km2()))


class RequestStateUpdate(models.Model):
    PENDING_STATE = 'PENDING'
    EVALUATING_STATE = 'EVALUATING'
    AWAITING_PAYMENT_STATE = 'AWAITING_PAYMENT'
    PROCESSING_STATE = 'PROCESSING'
    FINISHED_STATE = 'FINISHED'
    CANCELED_STATE = 'CANCELED'

    STATE_CHOICES = (
        (PENDING_STATE, _('pending')),
        (EVALUATING_STATE, _('evaluating')),
        (AWAITING_PAYMENT_STATE, _('awaiting payment')),
        (PROCESSING_STATE, _('processing')),
        (FINISHED_STATE, _('finished')),
        (CANCELED_STATE, _('canceled')),
    )

    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name='state_updates')
    state = models.CharField(
        max_length=24, choices=STATE_CHOICES, default=PENDING_STATE)
    description = models.TextField(null=True, blank=True)
    extra_fields = JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('created_at', )
