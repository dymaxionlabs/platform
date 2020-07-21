from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class UserQuota(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    max_projects_per_user = models.IntegerField(default=settings.MAX_PROJECTS_PER_USER)
    max_file_size = models.IntegerField(default=settings.MAX_FILE_SIZE)
    total_space_per_project = models.IntegerField(default=settings.TOTAL_SPACE_PER_PROJECT)
    max_estimator_per_project = models.IntegerField(default=settings.MAX_ESTIMATORS_PER_PROJECT)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
