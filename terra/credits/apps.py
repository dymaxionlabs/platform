from django.apps import AppConfig


class CreditsConfig(AppConfig):
    name = 'credits'

    def ready(self):
        import credits.signals