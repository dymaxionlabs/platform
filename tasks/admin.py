from django.conf import settings
from django.contrib import admin

from .models import Task, TaskLogEntry


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


class TaskLogEntryAdmin(admin.ModelAdmin):
    model = TaskLogEntry
    date_hierarchy = 'logged_at'
    list_display = (
        'logged_at',
        'task',
    )
    list_filter = ('task', )


admin.site.register(Task, TaskAdmin)
admin.site.register(TaskLogEntry, TaskLogEntryAdmin)
