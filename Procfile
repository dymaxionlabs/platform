# Procfile for development
web: PYTHONUNBUFFERED=true python manage.py runserver
worker: PYTHONUNBUFFERED=true python manage.py rqworker
subscriber: PYTHONUNBUFFERED=true python completed_job_subscriber.py
