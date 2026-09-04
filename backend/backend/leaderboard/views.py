"""Read-only leaderboard API."""

import logging
from functools import lru_cache

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.chain.client import get_contract
from backend.leaderboard.models import Player
from backend.leaderboard.queries import (
    global_stats,
    opens_for,
    player_rank,
    recent_opens,
    top,
    top_referrers,
    window_around,
)
from backend.leaderboard.serializers import ADDRESS_RE, AddressQuerySerializer

log = logging.getLogger(__name__)

TOP_SIZE = 20
WINDOW_SIZE = 5
ACTIVITY_SIZE = 20
HISTORY_SIZE = 50
REFERRAL_BPS = 1000  # 10%, matching the contract


def _bad_address(value: str) -> bool:
    return not ADDRESS_RE.match(value or "")


@lru_cache(maxsize=1)
def _chain_constants() -> dict:
    """Read prices and reveal timing from the contract once per process."""
    contract = get_contract()
    orbs = {}
    for orb_type in (0, 1, 2):
        price, enabled = contract.functions.orbConfig(orb_type).call()
        orbs[str(orb_type)] = {"price": str(price), "enabled": enabled}

    return {
        "orbs": orbs,
        "revealDelay": contract.functions.REVEAL_DELAY().call(),
        "revealWindow": contract.functions.REVEAL_WINDOW().call(),
        "rollSpace": contract.functions.ROLL_SPACE().call(),
        "rankBands": {
            "rank4": contract.functions.RANK_4_ROLLS().call(),
            "rank3": contract.functions.RANK_3_ROLLS().call(),
            "rank2": contract.functions.RANK_2_ROLLS().call(),
        },
        "pointRanges": {
            str(orb_type): _point_ranges(contract, orb_type) for orb_type in (0, 1, 2)
        },
    }


def _point_ranges(contract, orb_type: int) -> dict:
    minimums, maximums = contract.functions.getOrbPoints(orb_type).call()
    return {"min": list(minimums), "max": list(maximums)}


@api_view(["GET"])
def config(request):
    body = {
        "chainId": settings.CHAIN_ID,
        "contractAddress": settings.CONTRACT_ADDRESS,
        "rpcUrl": settings.RPC_URL,
        "confirmations": settings.CONFIRMATIONS,
    }
    try:
        body.update(_chain_constants())
    except Exception:  # noqa: BLE001
        log.warning("could not read chain constants for /api/config")
    return Response(body)


@api_view(["GET"])
def leaderboard(request):
    query = AddressQuerySerializer(data=request.query_params)
    if not query.is_valid():
        return Response(query.errors, status=400)

    address = query.validated_data.get("address") or ""
    return Response(
        {
            "top": top(limit=TOP_SIZE),
            "around": window_around(address, size=WINDOW_SIZE) if address else [],
        }
    )


@api_view(["GET"])
def player_detail(request, address: str):
    if _bad_address(address):
        return Response({"address": ["Malformed address"]}, status=400)

    player = get_object_or_404(Player, address=address.lower())
    return Response(
        {
            "address": player.address,
            "points": player.points,
            "referralPoints": player.referral_points,
            "rank": player_rank(player.address),
            "dailyStreak": player.daily_streak,
            "isPartner": player.is_partner,
            "referrer": player.referrer_id,
            "referralCount": player.referrals.count(),
        }
    )


@api_view(["GET"])
def player_referrals(request, address: str):
    if _bad_address(address):
        return Response({"address": ["Malformed address"]}, status=400)

    player = get_object_or_404(Player, address=address.lower())
    referrals = player.referrals.order_by("-points")
    return Response(
        {
            "count": referrals.count(),
            "referrals": [
                {
                    "address": r.address,
                    "points": r.points,
                    "earned": r.points * REFERRAL_BPS // 10_000,
                }
                for r in referrals
            ],
        }
    )


@api_view(["GET"])
def player_pending(request, address: str):
    if _bad_address(address):
        return Response({"address": ["Malformed address"]}, status=400)

    player = get_object_or_404(Player, address=address.lower())
    pending = getattr(player, "pending", None)
    if pending is None:
        return Response({"pending": None})

    return Response(
        {
            "pending": {
                "orbType": pending.orb_type,
                "commitBlock": pending.commit_block,
            }
        }
    )


@api_view(["GET"])
def activity(request):
    return Response({"opens": recent_opens(limit=ACTIVITY_SIZE)})


@api_view(["GET"])
def stats(request):
    return Response(global_stats())


@api_view(["GET"])
def referrers(request):
    return Response({"referrers": top_referrers(limit=TOP_SIZE)})


@api_view(["GET"])
def player_opens(request, address: str):
    if _bad_address(address):
        return Response({"address": ["Malformed address"]}, status=400)

    get_object_or_404(Player, address=address.lower())
    return Response({"opens": opens_for(address, limit=HISTORY_SIZE)})
