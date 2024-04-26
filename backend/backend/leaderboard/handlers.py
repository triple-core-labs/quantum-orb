"""Idempotent application of contract events to the database."""

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
    pending = PendingOrb.objects.filter(player=player).first()
    OrbOpen.objects.update_or_create(
        tx_hash=ev["transactionHash"],
        log_index=ev["logIndex"],
        defaults={
            "player": player,
            "commit_block": pending.commit_block if pending else 0,
            "orb_type": ev["args"]["orbType"],
            "rank": ev["args"]["rank"],
            "points": ev["args"]["points"],
            "block_number": ev["blockNumber"],
            "block_timestamp": ev["blockTimestamp"],
        },
    )
    PendingOrb.objects.filter(player=player).delete()


def handle_orb_expired(ev: dict) -> None:
    PendingOrb.objects.filter(player__address=ev["args"]["user"].lower()).delete()


def handle_points_credited(ev: dict) -> None:
    _set_authoritative_totals(
        _player(ev["args"]["user"]),
        points=ev["args"]["points"],
        referral_points=ev["args"]["referralPoints"],
    )


def _set_authoritative_totals(
    player: Player, *, points: int, referral_points: int
) -> None:
    player.points = points
    player.referral_points = referral_points
    player.save(update_fields=["points", "referral_points"])


def handle_daily_streak_changed(ev: dict) -> None:
    player = _player(ev["args"]["user"])
    player.daily_streak = ev["args"]["streak"]
    player.save(update_fields=["daily_streak"])


HANDLERS = {
    "UserRegistered": handle_user_registered,
    "DailyStreakChanged": handle_daily_streak_changed,
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
