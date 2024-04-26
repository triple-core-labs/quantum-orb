"""Leaderboard reads, ranked by one window function over the table."""

from django.db.models import Count, F, Max, Sum, Window
from django.db.models.functions import Coalesce, Rank

from backend.leaderboard.models import OrbOpen, Player


def ranked_players():
    return Player.objects.annotate(
        rank=Window(expression=Rank(), order_by=F("points").desc())
    ).order_by("-points", "address")


def _rows(players) -> list[dict]:
    return [
        {
            "address": p.address,
            "points": p.points,
            "referral_points": p.referral_points,
            "rank": p.rank,
        }
        for p in players
    ]


def top(limit: int = 20) -> list[dict]:
    return _rows(ranked_players()[:limit])


def player_rank(address: str) -> int | None:
    address = address.lower()
    for player in ranked_players():
        if player.address == address:
            return player.rank
    return None


def window_around(address: str, size: int = 5) -> list[dict]:
    address = address.lower()
    ordered = list(ranked_players())

    position = next((i for i, p in enumerate(ordered) if p.address == address), None)
    if position is None:
        return []

    start = max(0, position - size)
    end = position + size + 1
    return _rows(ordered[start:end])


def recent_opens(limit: int = 20) -> list[dict]:
    rows = OrbOpen.objects.select_related("player").order_by(
        "-block_number", "-log_index"
    )[:limit]
    return [_open_row(row) for row in rows]


def opens_for(address: str, limit: int = 50) -> list[dict]:
    rows = (
        OrbOpen.objects.select_related("player")
        .filter(player__address=address.lower())
        .order_by("-block_number", "-log_index")[:limit]
    )
    return [_open_row(row) for row in rows]


def _open_row(row) -> dict:
    return {
        "address": row.player_id,
        "orbType": row.orb_type,
        "rank": row.rank,
        "points": row.points,
        "txHash": row.tx_hash,
        "commitBlock": row.commit_block,
        "revealBlock": row.block_number,
        "timestamp": row.block_timestamp,
    }


def global_stats() -> dict:
    totals = OrbOpen.objects.aggregate(
        open_count=Count("id"),
        points_total=Coalesce(Sum("points"), 0),
        points_best=Coalesce(Max("points"), 0),
    )
    return {
        "players": Player.objects.count(),
        "orbsOpened": totals["open_count"],
        "pointsAwarded": totals["points_total"],
        "biggestOpen": totals["points_best"],
    }


def top_referrers(limit: int = 20) -> list[dict]:
    rows = (
        Player.objects.annotate(invited=Count("referrals"))
        .filter(invited__gt=0)
        .order_by("-referral_points", "-invited")[:limit]
    )
    return [
        {
            "address": row.address,
            "invited": row.invited,
            "referralPoints": row.referral_points,
        }
        for row in rows
    ]
