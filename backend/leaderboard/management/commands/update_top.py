from django.core.management.base import BaseCommand
from leaderboard.subgraph import queryTop
from leaderboard.models import BlastAddress

class Command(BaseCommand):
    help = 'Update top BlastAddresses'

    def handle(self, *args, **options):
        res = queryTop()
        print(res)
        for user in res:
            BlastAddress.objects.update_or_create(
                address=user['id'],
                defaults={'points': user['points']},
            )
