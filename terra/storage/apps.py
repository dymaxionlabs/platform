from django.apps import AppConfig


class StorageConfig(AppConfig):
    name = 'storage'

    def ready(self):
        import storage.signals
