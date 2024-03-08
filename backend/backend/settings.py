"""Django settings for the Quantum Orb backend.

Every value that differs between environments comes from the environment.
Nothing in this file is a working production secret.
"""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


def env_required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} must be set in the environment")
    return value


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def env_int(name: str, default: int) -> int:
    """An env var set to an empty string is absent, not zero.

    A .env copied from .env.example has every key present and blank, so
    os.environ.get(name, "0") returns "" and int() raises.
    """
    raw = os.environ.get(name, "").strip()
    return int(raw) if raw else default


def env_list(name: str, default: str = "") -> list[str]:
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = env_required("SECRET_KEY")
DEBUG = env_bool("DEBUG", False)
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "backend.leaderboard",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Above CommonMiddleware: below it, the headers are not applied to
    # responses CommonMiddleware short-circuits.
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:4200")

ROOT_URLCONF = "backend.urls"
WSGI_APPLICATION = "backend.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL",
            "postgres://quantumorb:quantumorb@db:5432/quantumorb",
        ),
        conn_max_age=600,
    )
}

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"anon": "120/min"},
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation."
        "UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {
        "NAME": "django.contrib.auth.password_validation."
        "NumericPasswordValidator"
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------------- chain

RPC_URL = os.environ.get("RPC_URL") or "https://sepolia.blast.io"
CHAIN_ID = env_int("CHAIN_ID", 168587773)
CONTRACT_ADDRESS = os.environ.get("CONTRACT_ADDRESS", "")
CONTRACT_START_BLOCK = env_int("CONTRACT_START_BLOCK", 0)
CONTRACT_ABI_PATH = Path(
    os.environ.get("CONTRACT_ABI_PATH", "/app/contracts/abi/QuantumOrb.json")
)

# Blocks to stay behind head, so a shallow reorg never reaches indexed data.
CONFIRMATIONS = env_int("CONFIRMATIONS", 3)

RELAYER_PRIVATE_KEY = os.environ.get("RELAYER_PRIVATE_KEY", "")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "plain": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"}
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "plain"}
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
