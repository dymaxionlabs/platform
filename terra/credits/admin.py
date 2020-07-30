from django.contrib import admin

from .models import LogEntry


class LogEntryAdmin(admin.ModelAdmin):
    list_display = ['datetime', 'kind', 'description', 'value']
    date_hierarchy = 'datetime'
    ordering = ['-datetime']


admin.site.register(LogEntry, LogEntryAdmin)
