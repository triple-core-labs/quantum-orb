import importlib

import pytest


def test_debug_defaults_to_false(monkeypatch):
    monkeypatch.delenv("DEBUG", raising=False)
    from backend import settings

    importlib.reload(settings)
    assert settings.DEBUG is False


def test_secret_key_is_not_hardcoded():
    from backend import settings

    assert "django-insecure" not in settings.SECRET_KEY


def test_allowed_hosts_is_never_wildcard():
    from backend import settings

    assert "*" not in settings.ALLOWED_HOSTS


def test_cors_is_an_explicit_allowlist():
    from backend import settings

    assert getattr(settings, "CORS_ALLOW_ALL_ORIGINS", False) is False
    assert isinstance(settings.CORS_ALLOWED_ORIGINS, list)


def test_cors_middleware_precedes_common_middleware():
    from backend import settings

    cors = settings.MIDDLEWARE.index("corsheaders.middleware.CorsMiddleware")
    common = settings.MIDDLEWARE.index("django.middleware.common.CommonMiddleware")
    assert cors < common, "CorsMiddleware must run before CommonMiddleware"


@pytest.mark.parametrize(
    "name", ["RPC_URL", "CONTRACT_ADDRESS", "CONTRACT_START_BLOCK"]
)
def test_chain_settings_are_present(name):
    from backend import settings

    assert hasattr(settings, name)
