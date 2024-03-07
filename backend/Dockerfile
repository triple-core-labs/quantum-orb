FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

RUN pip install --no-cache-dir poetry==1.8.5

# Dependency layer: cached until pyproject or the lock changes.
COPY pyproject.toml poetry.lock* /app/
RUN poetry install --no-interaction --no-root

COPY backend /app/backend
COPY manage.py entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Non-root: nothing here needs to write to the image.
RUN useradd --create-home --uid 10001 appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
# --bind 0.0.0.0 or the published port reaches nothing.
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
