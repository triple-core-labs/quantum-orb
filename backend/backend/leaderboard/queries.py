"""Leaderboard reads, ranked by one window function over the table."""

from django.db.models import F, Window
from django.db.models.functions import Rank

from backend.leaderboard.models import Player


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
