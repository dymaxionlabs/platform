import rasterio
import tempfile
from storage.client import GCSClient

def get_raster_metadata(file):
    crs = None if file.metadata is None else file.metadata.get('crs')
    transform = None if file.metadata is None else file.metadata.get('transform')
    if crs is None or transform is None:
        client = GCSClient(file.project)
        with tempfile.NamedTemporaryFile() as tmpfile:
            src = tmpfile.name
            files = list(client.list_files(file.path))
            files[0].download_to_filename(src)
            with rasterio.open(src) as ds:
                if ds.driver == 'GTiff':
                    if file.metadata is None:
                        file.metadata = {'crs': str(ds.crs), 'transform': ds.transform }
                    else: 
                        file.metadata.update(crs=str(ds.crs))
                        file.metadata.update(transform=ds.transform)
                    file.save(update_fields=["metadata"])
            crs = file.metadata.get('crs')
            transform = file.metadata.get('transform')
    return crs, transform