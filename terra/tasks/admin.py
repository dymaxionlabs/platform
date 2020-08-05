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
        'args',
        'kwargs',
        'state',
        'created_at',
        'finished_at',
    )
    list_display_links = ('id', 'name')
    list_filter = (
        'state',
        'finished_at',
        'name',
    )
    search_fields = ('name', 'id', 'status')


class TaskLogEntryAdmin(admin.ModelAdmin):
    model = TaskLogEntry
    date_hierarchy = 'logged_at'
    list_display = (
        'logged_at',
        'task',
    )
    list_filter = ('task', )
    ordering = ['-logged_at']


admin.site.register(Task, TaskAdmin)
admin.site.register(TaskLogEntry, TaskLogEntryAdmin)
