# Procfile for development
web: PYTHONUNBUFFERED=true python manage.py runserver
worker: PYTHONUNBUFFERED=true celery -A terra worker -l info
flower: PYTHONUNBUFFERED=true celery -A terra flower
