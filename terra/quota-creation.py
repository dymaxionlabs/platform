#!/usr/bin/env python3
import django
import os
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "terra.settings")
django.setup()

from django.contrib.auth.models import User
from quotas.models import UserQuota


def quota_creation():
    for user in User.objects.all():
        UserQuota.objects.get_or_create(user=user)


if __name__ == '__main__':
    quota_creation()
