from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from projects.models import CreatedAtUpdatedAtModelMixin

class UserQuota(CreatedAtUpdatedAtModelMixin, models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    max_projects_per_user = models.IntegerField(default=settings.MAX_PROJECTS_PER_USER)
    max_file_size = models.BigIntegerField(default=settings.MAX_FILE_SIZE)
    total_space_per_user = models.BigIntegerField(default=settings.TOTAL_SPACE_PER_USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return """{user}: Projects: {projects}, User Storage: {user_storage},
            Max File Size: {file_size} """.format(
            user=self.user,
            projects=self.max_projects_per_user,
            user_storage=self.total_space_per_user,
            file_size=self.max_file_size
        )
