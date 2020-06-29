from django.apps import AppConfig


class EstimatorsConfig(AppConfig):
    name = 'estimators'

    def ready(self):
        import estimators.signals