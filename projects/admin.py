from django.contrib import admin
from django import forms
from django.contrib.gis.geos import GEOSGeometry
import json

from .models import Layer, Map, MapLayer, Project, UserProfile


class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'group_names', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')

    def group_names(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])


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
            polygon = GEOSGeometry(json.dumps(geojson['features'][0]['geometry']))
            instance.area_geom = polygon
        if commit:
            instance.save()
        return instance

    class Meta:
        model = Layer
        fields = '__all__'


class LayerAdmin(admin.ModelAdmin):
    form = LayerForm
    list_display = ('id', 'name', 'layer_type', 'project', 'date',
                    'created_at', 'tiles_url')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'project', 'layer_type', 'date')


class MapLayerInline(admin.TabularInline):
    model = MapLayer


class MapAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'project', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description', 'project')
    inlines = [MapLayerInline]


admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Layer, LayerAdmin)
admin.site.register(Map, MapAdmin)
