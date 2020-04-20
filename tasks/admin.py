from django.conf import settings
from django.contrib import admin

from .models import Task


class TaskAdmin(admin.ModelAdmin):
    """Admin-interface for tasks"""

    model = Task
    date_hierarchy = 'finished_at'
    list_display = (
        'id',
        'name',
        'state',
        'created_at',
        'finished_at',
    )
    list_filter = (
        'state',
        'finished_at',
        'name',
    )
    search_fields = ('name', 'id', 'status')

    def get_readonly_fields(self, request, obj=None):
        return list(set([field.name for field in self.opts.local_fields]))


admin.site.register(Task, TaskAdmin)
