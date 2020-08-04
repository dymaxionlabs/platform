from django.apps import apps


def load_tests(loader, tests, pattern):
    from django.conf import settings

    if apps.is_installed("quotations.apps.QuotationsConfig"):
        pass  # Actually load the tests
