"""Apply contract events to the database.

Every handler is idempotent: the indexer re-reads a trailing window on each
cycle to absorb reorgs, so the same log may arrive more than once.
"""

import logging

from django.db import transaction

from backend.leaderboard.models import OrbOpen, PendingOrb, Player

log = logging.getLogger(__name__)

ZERO_ADDRESS = "0x" + "0" * 40


def _norm(address: str | None) -> str | None:
    if not address or address.lower() == ZERO_ADDRESS:
        return None
    return address.lower()


def _player(address: str) -> Player:
    player, _ = Player.objects.get_or_create(address=address.lower())
    return player


def handle_user_registered(ev: dict) -> None:
    player = _player(ev["args"]["user"])
    referrer_address = _norm(ev["args"].get("referrer"))
    if referrer_address:
        player.referrer = _player(referrer_address)
        player.save(update_fields=["referrer"])


def handle_orb_committed(ev: dict) -> None:
    player = _player(ev["args"]["user"])
    PendingOrb.objects.update_or_create(
        player=player,
        defaults={
            "orb_type": ev["args"]["orbType"],
            "commit_block": ev["args"]["commitBlock"],
        },
    )


def handle_orb_opened(ev: dict) -> None:
    player = _player(ev["args"]["user"])
    OrbOpen.objects.update_or_create(
        tx_hash=ev["transactionHash"],
        log_index=ev["logIndex"],
        defaults={
            "player": player,
            "orb_type": ev["args"]["orbType"],
            "rank": ev["args"]["rank"],
            "points": ev["args"]["points"],
            "block_number": ev["blockNumber"],
            "block_timestamp": ev["blockTimestamp"],
        },
    )
    PendingOrb.objects.filter(player=player).delete()


def handle_orb_expired(ev: dict) -> None:
    PendingOrb.objects.filter(
        player__address=ev["args"]["user"].lower()
    ).delete()


def handle_points_credited(ev: dict) -> None:
    # The event carries the running totals straight from contract storage, so
    # assignment is correct and replay-safe where accumulation would not be.
    # Only these two fields are touched: a player's referrer is set by
    # UserRegistered and must survive.
    player = _player(ev["args"]["user"])
    player.points = ev["args"]["points"]
    player.referral_points = ev["args"]["referralPoints"]
    player.save(update_fields=["points", "referral_points"])


HANDLERS = {
    "UserRegistered": handle_user_registered,
    "OrbCommitted": handle_orb_committed,
    "OrbOpened": handle_orb_opened,
    "OrbExpired": handle_orb_expired,
    "PointsCredited": handle_points_credited,
}


@transaction.atomic
def apply_event(event: dict) -> None:
    handler = HANDLERS.get(event["event"])
    if handler is None:
        return
    handler(event)
