"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.core.signals import ready
from django.dispatch import receiver

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

application = get_wsgi_application()

from background_task.models import Task
from backend.leaderboard.tasks import update_top_blast_addresses

# Check if the task is already scheduled
if not Task.objects.filter(task_name='backend.leaderboard.tasks.update_top_blast_addresses').exists():
    # If not, schedule the task
    update_top_blast_addresses(repeat=60)
