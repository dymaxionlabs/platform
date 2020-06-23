"""
Django settings for terra project.

Generated by 'django-admin startproject' using Django 2.1.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration


def get_allowed_hosts():
    """
    Get allowed hosts from .env file

    If DEBUG = True and ALLOWED_HOSTS is empty or null,
    default to ['.dymaxionlabs.com']

    """
    hosts = [s for s in os.getenv('ALLOWED_HOSTS', '').split(',') if s]
    if not DEBUG and not hosts:
        hosts = ['.dymaxionlabs.com']
    return hosts


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = int(os.getenv('DEBUG', 0)) > 0

ALLOWED_HOSTS = get_allowed_hosts()

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'django.contrib.sites',
    'projects.apps.ProjectsConfig',
    'estimators.apps.EstimatorsConfig',
    'quotations.apps.QuotationsConfig',
    'storage.apps.StorageConfig',
    'tasks.apps.TasksConfig',
    'rest_framework',
    'rest_framework_gis',
    'rest_framework.authtoken',
    "rest_framework_api_key",
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'rest_auth',
    'rest_auth.registration',
    'corsheaders',
    'anymail',
    'drf_yasg',
    'jsoneditor',
    'guardian',
    'django_rq',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware'
]

ROOT_URLCONF = 'terra.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'libraries': {
                'global_settings': 'terra.templatetags.global_settings',
            }
        },
    },
]

WSGI_APPLICATION = 'terra.wsgi.application'

# Emails

ANYMAIL = {
    'MAILGUN_API_KEY': os.getenv('MAILGUN_API_KEY'),
    'MAILGUN_SENDER_DOMAIN': os.getenv('MAILGUN_SENDER_DOMAIN'),
}

# In production, add this to your .env:
#   EMAIL_BACKEND=anymail.backends.mailgun.EmailBackend
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND',
                          'django.core.mail.backends.console.EmailBackend')

DEFAULT_FROM_EMAIL = 'Dymaxion Analytics <{email}>'.format(
    email=os.getenv('DEFAULT_FROM_EMAIL'))

EMAIL_SUBJECT_PREFIX = None

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',  # default
    'guardian.backends.ObjectPermissionBackend',
)

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME':
        'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME':
        'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME':
        'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME':
        'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-US'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'templates', 'static')]

LOCALE_PATHS = [os.path.join(BASE_DIR, 'locale')]

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer', ),
    'DEFAULT_AUTHENTICATION_CLASSES':
    ('terra.authentication.TokenAuthentication', ),
    'DEFAULT_PERMISSION_CLASSES':
    ('rest_framework.permissions.IsAuthenticated', ),
    'DEFAULT_PAGINATION_CLASS':
    'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 25
}

# Allow all domains
CORS_ORIGIN_ALLOW_ALL = True

SWAGGER_SETTINGS = {
    'USE_SESSION_AUTH': False,
    'SECURITY_DEFINITIONS': {
        'User token or Api-Key': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}

SITE_ID = 1

ACCOUNT_ADAPTER = 'terra.adapter.DefaultAccountAdapterCustom'

MEDIA_ROOT = os.path.join(BASE_DIR, 'uploads/')
MEDIA_URL = '/uploads/'

FILES_BUCKET = os.getenv('FILES_BUCKET')
TILES_BUCKET = os.getenv('TILES_BUCKET')
ESTIMATORS_BUCKET = os.getenv('ESTIMATORS_BUCKET')

WEBCLIENT_URL = os.getenv('WEBCLIENT_URL')

# For images and other uploaded files
# In production, add this to your .env:
#   DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
DEFAULT_FILE_STORAGE = os.getenv(
    'DEFAULT_FILE_STORAGE', 'django.core.files.storage.FileSystemStorage')

GS_BUCKET_NAME = FILES_BUCKET

RQ_QUEUES = {
    'default': {
        'URL': os.getenv('RQ_REDIS_URL', 'redis://localhost:6379/0'),
        'DEFAULT_TIMEOUT': os.getenv('RQ_TIMEOUT', 360),
    }
}

RQ_SHOW_ADMIN_LINK = True

# Configure Sentry
if os.environ['SENTRY_DNS']:
    sentry_sdk.init(dsn=os.environ['SENTRY_DNS'],
                    integrations=[DjangoIntegration()])

CELERY_RESULT_BACKEND = 'tasks.backends.DatabaseBackend'

# Path to directory that holds temporary raster/vector tiles
TILES_DIR = os.path.join(BASE_DIR, 'tiles')

SCRIPT_DIR = os.path.join(BASE_DIR, 'script')

MAILCHIMP_APIKEY = os.getenv('MAILCHIMP_APIKEY')
MAILCHIMP_USER = os.getenv('MAILCHIMP_USER')
MAILCHIMP_AUDIENCE_IDS = {'default': '3555c83b2c'}

CONTACT_EMAIL = 'contact@dymaxionlabs.com'
COMPANY_NAME = 'Dymaxion Labs'
LIST_ADDRESS_HTML = 'Maipú 812 10E, Ciudad de Buenos Aires, Argentina (C1006ACL)'

REST_AUTH_SERIALIZERS = {
    'PASSWORD_RESET_SERIALIZER': 'terra.serializers.PasswordResetSerializer',
    'USER_DETAILS_SERIALIZER': 'projects.serializers.UserDetailsSerializer'
}

REST_AUTH_REGISTER_SERIALIZERS = {
    'REGISTER_SERIALIZER': 'projects.serializers.UserRegistrationSerializer'
}

GOOGLE_SDK_BIN_PATH = os.getenv('GOOGLE_SDK_BIN_PATH')
GOOGLE_CREDENTIALS = os.getenv(
    'GOOGLE_CREDENTIALS', os.path.join(BASE_DIR, '.google_client_secret.json'))
GOOGLE_AUTH_TOKEN_FILE = os.path.join(BASE_DIR, '.google_auth_token.pkl')

# Google Cloud Pub/Sub settings
PUBSUB_PROJECT_ID = os.getenv('PUBSUB_PROJECT_ID', 'dyma-staging')
PUBSUB_JOB_TOPIC_ID = os.getenv('PUBSUB_JOB_TOPIC_ID', 'jobs-v2')

# Google CloudML settings
CLOUDML_DIRECTORY = os.getenv('CLOUDML_DIRECTORY', '.')
CLOUDML_PROJECT = os.getenv('CLOUDML_PROJECT', 'dyma-staging')
CLOUDML_REGION = os.getenv('CLOUDML_REGION', 'us-central1')
CLOUDML_DEAULT_EPOCHS = 10
CLOUDML_DEFAULT_PREDICTION_CONFIDENCE = 0.1

LAYERS_FILL_COLOR = [
    '#f0251c', '#f5f518', '#4af31c', '#1fe7c5', '#1f54d6', '#9319bd', '#9c8686'
]
LAYERS_COLOR = [
    '#951a15', '#b9b916', '#35a517', '#1e937f', '#133076', '#5f1578', '#716a6a'
]

# STAC API CONST
STAC_SERVER_URL = 'https://sat-api.developmentseed.org'
STAC_SEARCH_PATH = '/stac/search'

#Estimated time for finish of a TrainingJob / PredictionJob
APROX_JOBS_TIME = 120

TIPPECANOE_BIN_PATH = os.getenv('TIPPECANOE_BIN_PATH',
                                '/usr/local/bin/tippecanoe')
OGR2OGR_BIN_PATH = os.getenv('OGR2OGR_BIN_PATH', '/usr/bin/ogr2ogr')
