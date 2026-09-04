from django.conf import settings
from django.core.management.base import BaseCommand
from eth_account import Account

from backend.chain.client import get_contract, get_web3
from backend.leaderboard.relayer import RelayerError, run_forever


class Command(BaseCommand):
    help = "Submit revealOrb for committed orbs once their block is final"

    def handle(self, *args, **options):
        if not settings.RELAYER_PRIVATE_KEY:
            raise RelayerError(
                "RELAYER_PRIVATE_KEY must be set. Generate one with "
                "`node scripts/new-relayer-key.js`."
            )
        account = Account.from_key(settings.RELAYER_PRIVATE_KEY)
        run_forever(get_contract(), get_web3(), account)
