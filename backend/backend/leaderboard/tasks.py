from background_task import background
from django.core.management import call_command

@background(schedule=60)
def update_top_blast_addresses():
    call_command('update_top')
