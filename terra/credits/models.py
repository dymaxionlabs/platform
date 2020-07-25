from django.contrib.auth.models import User
from django.db import models


class LogEntry(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.SET_NULL,
                             null=True,
                             related_name='credit_log_entry')
    datetime = models.DateTimeField(auto_now_add=True)
    kind = models.CharField(max_length=64)
    description = models.CharField(max_length=255, null=True)
    value = models.FloatField()

    def __str__(self):
        return f'[{self.kind}] {self.description} ({self.value})'

    @classmethod
    def available_credits(cls, user):
        res = cls.objects.filter(user=user).aggregate(models.Sum('value'))
        return res['value__sum']

    @classmethod
    def calculate_task_cost(cls, duration):
        return round(duration * 300)