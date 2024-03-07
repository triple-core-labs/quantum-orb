#!/usr/bin/env sh
set -e

# Migrations run at start, not at build: the database is a service, not a
# layer in the image.
python manage.py migrate --noinput

exec "$@"
