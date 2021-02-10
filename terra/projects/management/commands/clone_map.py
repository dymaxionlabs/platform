from uuid import uuid4
from django.core.management.base import BaseCommand, CommandError
from projects.models import Project, Map, Layer, MapLayer
import subprocess


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

        new_map = Map.objects.get(pk=options['map_id'])
        new_map.pk = None
        new_map.project = project
        new_map.uuid = uuid4()
        new_map.save()

        orig_map = Map.objects.get(pk=options['map_id'])
        map_layers = MapLayer.objects.filter(map=orig_map)
        for new_map_layer in map_layers:
            new_layer = new_map_layer.layer
            new_layer.pk = None
            new_layer.project = project
            orig_layer_uuid = new_layer.uuid
            new_layer.uuid = uuid4()
            new_layer.save()

            # Copy tiles fron old layer to new layer directory
            self.copy_layer_tiles(orig_layer_uuid, new_layer.uuid)

            new_map_layer.pk = None
            new_map_layer.map = new_map
            new_map_layer.layer = new_layer
            new_map_layer.save()

    def copy_layer_tiles(self, src_uuid, dst_uuid):
        src = Layer.objects.get(uuid=src_uuid)
        dst = Layer.objects.get(uuid=dst_uuid)
        src_url = src.tiles_bucket_url()
        dst_url = dst.tiles_bucket_url()
        if src.layer_type == Layer.RASTER:
            self.run_command(
                f"gsutil -m cp -a public-read -r {src_url}/* {dst_url}/")
        elif src.layer_type == Layer.VECTOR:
            self.run_command(
                f"gsutil -m -h \"Content-Type: application/octet-stream\" -h \"Content-Encoding: gzip\" cp -a public-read -r {src_url}/* {dst_url}/"
            )
            self.run_command(
                f"gsutil -m -h \"Content-Type: application/json\" cp -a public-read -r {src_url}/metadata.json {dst_url}/"
            )
        else:
            raise RuntimeError(f"Unknown layer type! {src.layer_type}")

    def run_command(self, cmd):
        print(cmd)
        subprocess.run(cmd, shell=True, check=True)
