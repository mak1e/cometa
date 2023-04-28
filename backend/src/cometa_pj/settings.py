"""
Django settings for cometa_pj project.

Generated by 'django-admin startproject' using Django 2.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os, sys
# just to import secrets
sys.path.append("/code")
import secret_variables
from backend.common import *

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SCREENSHOTS_ROOT = '/code/behave/screenshots/'

SENTRY_DJANGO = getattr(secret_variables, 'COMETA_SENTRY_DJANGO', False)

DOMAIN = getattr(secret_variables, 'COMETA_DOMAIN', '')
IS_DEV = DOMAIN == 'localhost'

if SENTRY_DJANGO and not IS_DEV:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    # Initialize Sentry reporting
    sentry_sdk.init(
        dsn=SENTRY_DJANGO,
        integrations=[DjangoIntegration()],
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production,
        traces_sample_rate=1.0,
        release=version,
        environment=DOMAIN,
        request_bodies='always'
    )

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = getattr(secret_variables, 'COMETA_DJANGO_SECRETKEY', '')

# SECURITY WARNING: don't run with debug turned on in production!
COMETA_DEBUG = getattr(secret_variables, 'COMETA_DEBUG', False)
DEBUG = COMETA_DEBUG == 'True' or COMETA_DEBUG == True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'backend.apps.BackendConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'backend.templatetags.humanize',
    'command_log.apps.ManagementCommandLogConfig'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'backend.middlewares.authentication.AuthenticationMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CSRF_COOKIE_PATH = '/admin'

CORS_ORIGIN_ALLOW_ALL = True

CORS_ALLOW_HEADERS = (
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'AUTHTOKEN',
    'AUTH'
)

ROOT_URLCONF = 'cometa_pj.urls'

REST_FRAMEWORK = {
     #'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend',)
     #'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
     'DEFAULT_PAGINATION_CLASS': 'backend.paginations.StandardResultsSetPagination',
     #'PAGE_SIZE': 2,
     'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
    ]
 }


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(os.path.dirname(__file__), '../templates/pdf')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cometa_pj.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': 'db',
        'PORT': 5432
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

FILE_UPLOAD_HANDLERS = [
    'backend.utility.uploadFile.TempFileUploadHandler',
]

# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en-us'
USE_I18N = False
USE_L10N = False
USE_TZ = False

if getattr(secret_variables, 'COMETA_EMAIL_ENABLED', 'False') == "True":
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = getattr(secret_variables, 'COMETA_EMAIL_HOST', '')
    EMAIL_PORT = 25
    EMAIL_HOST_USER = getattr(secret_variables, 'COMETA_EMAIL_USER', '')
    COMETA_EMAIL_PASSWORD = getattr(secret_variables, 'COMETA_EMAIL_PASSWORD', '')
    if COMETA_EMAIL_PASSWORD != '':
        EMAIL_HOST_PASSWORD = COMETA_EMAIL_PASSWORD
    EMAIL_USE_TLS = False

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_URL = '/static/'

#OPTIONAL | MANDATORY
USERIDFLAG = "OPTIONAL"

# LOGGER CONFIGURATION
# From: https://stackoverflow.com/questions/52004910/django-and-docker-outputting-information-to-console
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'formatters': {
        'verbose': {
            "format": "[%(asctime)s][%(levelname)s][%(process)d:%(processName)s][%(thread)d:%(threadName)s] - %(message)s"
        },
        'django.server': {
            '()': 'django.utils.log.ServerFormatter',
            'format': '[%(server_time)s] %(message)s',
        }
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
        },
        # Custom handler which we will use with logger 'django'.
        # We want errors/warnings to be logged when DEBUG=False
        'console_on_not_debug': {
            'level': 'WARNING',
            'filters': ['require_debug_false'],
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'django.server': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'django.server',
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'error_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': "logs/error.log",
            'maxBytes': 1000000,
            'backupCount': 7,
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'mail_admins', 'console_on_not_debug', 'error_file'],
            'level': 'INFO',
        },
        'django.server': {
            'handlers': ['django.server'],
            'level': 'INFO',
            'propagate': False,
        },
    }
}