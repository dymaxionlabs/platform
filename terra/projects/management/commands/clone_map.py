from django.core.management.base import BaseCommand, CommandError
from projects.models import Project, Map, Layer


class Command(BaseCommand):
    help = 'Clone a Map, including all of its Layers, to another Project'

    def add_arguments(self, parser):
        parser.add_argument('--map-id',
                            required=True,
                            type=int,
                            help='map id to clone from')
        parser.add_argument('--project-id',
                            required=True,
                            type=int,
                            help='project id to copy map to')

    def handle(self, *args, **options):
        project = Project.objects.get(pk=options['project_id'])
        orig_map = Map.objects.get(pk=options['map_id'])

        new_map = orig_map.clone()
        new_map.project = project
        new_map.pk = None
        new_map.uuid = None
        new_map.save()

        for layer in orig_map.layers():
            new_layer = layer.clone()
            new_layer.project = project
            new_layer.pk = None
            new_layer.uuid = None
            new_layer.map = new_map
            new_layer.save()
            # TODO Copy tiles fron old layer to new layer directory
            # ...
