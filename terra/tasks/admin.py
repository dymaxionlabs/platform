import json

from django.conf import settings
from django.contrib import admin
from django.utils.html import format_html

from .models import Task, TaskLogEntry


class TaskAdmin(admin.ModelAdmin):
    """Admin-interface for tasks"""

    model = Task
    date_hierarchy = 'finished_at'
    list_display = (
        'id',
        'name',
        'arguments',
        'keyword_arguments',
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

    def arguments(self, instance):
        return format_html('<pre>{}</pre>',
                           json.dumps(instance.args, indent=4, sort_keys=True))

    def keyword_arguments(self, instance):
        return format_html(
            '<pre>{}</pre>',
            json.dumps(instance.kwargs, indent=4, sort_keys=True))


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
