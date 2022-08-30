from django.contrib import admin

from .models import UserQuota


class UserQuotaAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'max_projects_per_user',
        'max_file_size',
        'total_space_per_user',
        'updated_at',
    )


admin.site.register(UserQuota, UserQuotaAdmin)
