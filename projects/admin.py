import json

from django import forms
from django.contrib import admin
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.postgres.fields import JSONField
from jsoneditor.forms import JSONEditor

from .models import (Image, Layer, Map, MapLayer, Project, UserProfile,
                     ProjectInvitationToken)


class ProjectInvitationTokenAdmin(admin.ModelAdmin):
    list_display = (
        'key',
        'project',
        'email',
        'confirmed',
        'created_at',
        'updated_at',
    )
    fields = (
        'project',
        'email',
    )
    ordering = (
        '-created_at',
        'project',
        'email',
    )


class ProjectAdmin(admin.ModelAdmin):
    list_filter = ('owners', )
    list_display = (
        'id',
        'name',
        'description',
        'owner_names',
        'created_at',
    )
    list_display_links = ('id', 'name')
    search_fields = (
        'name',
        'description',
    )

    def owner_names(self, obj):
        return ", ".join([u.username for u in obj.owners.all()])


class LayerForm(forms.ModelForm):
    area_geojson_file = forms.FileField()

    def __init__(self, *args, **kwargs):
        super(LayerForm, self).__init__(*args, **kwargs)
        self.fields['area_geom'].required = False
        self.fields['area_geojson_file'].required = False

    def save(self, commit=True):
        instance = super(LayerForm, self).save(commit=False)
        area_geojson_file = self.cleaned_data.get('area_geojson_file', None)
        if area_geojson_file:
            geojson = json.load(area_geojson_file)
            feature = geojson['features'][0]
            polygon = GEOSGeometry(
                json.dumps(geojson['features'][0]['geometry']))
            instance.area_geom = polygon
        if commit:
            instance.save()
        return instance

    class Meta:
        model = Layer
        fields = '__all__'


class LayerAdmin(admin.ModelAdmin):
    form = LayerForm
    list_filter = ('project', 'layer_type')
    list_display = (
        'id',
        'name',
        'layer_type',
        'project',
        'date',
        'created_at',
        'tiles_url',
    )
    list_display_links = ('id', 'name')
    search_fields = (
        'name',
        'description',
        'project',
        'layer_type',
        'date',
    )
    formfield_overrides = {
        JSONField: {
            'widget': JSONEditor
        },
    }


class MapLayerInline(admin.TabularInline):
    model = MapLayer


class MapAdmin(admin.ModelAdmin):
    list_filter = ('project', )
    list_display = (
        'id',
        'name',
        'description',
        'project',
        'created_at',
    )
    list_display_links = ('id', 'name')
    search_fields = (
        'name',
        'description',
        'project',
    )
    inlines = [MapLayerInline]
    formfield_overrides = {
        JSONField: {
            'widget': JSONEditor
        },
    }


class ImageAdmin(admin.ModelAdmin):
    list_filter = ('owner', )


admin.site.register(UserProfile)
admin.site.register(ProjectInvitationToken, ProjectInvitationTokenAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(Map, MapAdmin)
admin.site.register(Image, ImageAdmin)
