from django.core.management.base import BaseCommand

from backend.chain.client import get_contract, get_web3
from backend.leaderboard.indexer import run_forever


class Command(BaseCommand):
    help = "Index QuantumOrb contract events into the database"

    def handle(self, *args, **options):
        run_forever(get_contract(), get_web3())
