from django.contrib import admin
from .models import File

class FileAdmin(admin.ModelAdmin):
    list_display = (
        'project', 
        'path', 
        'size', 
        'complete', 
        'metadata',
        'created_at',
        'updated_at',
    )


admin.site.register(File, FileAdmin)