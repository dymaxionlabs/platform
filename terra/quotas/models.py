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

    def __str__(self):
        return """{user}: Projects: {projects}, Project Storage: {project_storage}, 
                Estiators per project: {estimators}, Max File Size: {file_size} """.format(
            user=self.user, 
            projects=self.max_projects_per_user, 
            project_storage=self.total_space_per_project, 
            estimators=self.max_estimator_per_project, 
            file_size=self.max_file_size
        )


    def check_total_space_per_project(self, bytes):
        return self.total_space_per_project * 1024 * 1024 * 1024 > bytes