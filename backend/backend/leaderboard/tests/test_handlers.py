import pytest

from backend.leaderboard.handlers import apply_event
from backend.leaderboard.models import OrbOpen, OrbType, PendingOrb, Player

pytestmark = pytest.mark.django_db

ALICE = "0x00000000000000000000000000000000000000a1"
BOB = "0x00000000000000000000000000000000000000b2"


def event(name, args, *, tx="0xdead", log_index=0, block=100, ts=1_700_000_000):
    return {
        "event": name,
        "args": args,
        "transactionHash": tx,
        "logIndex": log_index,
        "blockNumber": block,
        "blockTimestamp": ts,
    }


def test_user_registered_creates_a_player():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    assert Player.objects.get(address=ALICE).referrer is None


def test_user_registered_lowercases_the_address():
    apply_event(event("UserRegistered", {"user": ALICE.upper(), "referrer": None}))
    assert Player.objects.filter(address=ALICE).exists()


def test_user_registered_links_the_referrer():
    apply_event(event("UserRegistered", {"user": BOB, "referrer": None}))
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": BOB}))
    assert Player.objects.get(address=ALICE).referrer.address == BOB


def test_orb_committed_creates_a_pending_row():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    apply_event(
        event("OrbCommitted", {"user": ALICE, "orbType": 1, "commitBlock": 500})
    )
    pending = PendingOrb.objects.get(player__address=ALICE)
    assert pending.orb_type == OrbType.GENESIS
    assert pending.commit_block == 500


def test_orb_opened_records_the_open_and_clears_pending():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    apply_event(event("OrbCommitted", {"user": ALICE, "orbType": 0, "commitBlock": 5}))
    apply_event(
        event(
            "OrbOpened",
            {"user": ALICE, "orbType": 0, "rank": 3, "points": 275},
            log_index=1,
        )
    )

    opened = OrbOpen.objects.get(player__address=ALICE)
    assert opened.rank == 3
    assert opened.points == 275
    assert not PendingOrb.objects.filter(player__address=ALICE).exists()


def test_orb_opened_is_idempotent():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    payload = event(
        "OrbOpened",
        {"user": ALICE, "orbType": 0, "rank": 1, "points": 30},
        log_index=1,
    )
    apply_event(payload)
    apply_event(payload)
    assert OrbOpen.objects.count() == 1


def test_points_credited_sets_authoritative_totals():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    apply_event(
        event(
            "PointsCredited",
            {"user": ALICE, "points": 1234, "referralPoints": 56, "reason": 0},
        )
    )
    player = Player.objects.get(address=ALICE)
    assert player.points == 1234
    assert player.referral_points == 56


def test_points_credited_replays_without_doubling():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    payload = event(
        "PointsCredited",
        {"user": ALICE, "points": 100, "referralPoints": 0, "reason": 0},
    )
    apply_event(payload)
    apply_event(payload)
    # The event carries running totals from contract storage, so applying it
    # twice must not accumulate.
    assert Player.objects.get(address=ALICE).points == 100


def test_points_credited_does_not_erase_the_referrer():
    apply_event(event("UserRegistered", {"user": BOB, "referrer": None}))
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": BOB}))
    apply_event(
        event(
            "PointsCredited",
            {"user": ALICE, "points": 10, "referralPoints": 0, "reason": 0},
        )
    )
    assert Player.objects.get(address=ALICE).referrer.address == BOB


def test_orb_expired_clears_pending():
    apply_event(event("UserRegistered", {"user": ALICE, "referrer": None}))
    apply_event(event("OrbCommitted", {"user": ALICE, "orbType": 1, "commitBlock": 5}))
    apply_event(
        event(
            "OrbExpired",
            {"user": ALICE, "orbType": 1, "refunded": 1500000000000000},
            log_index=1,
        )
    )
    assert not PendingOrb.objects.filter(player__address=ALICE).exists()


def test_unknown_events_are_ignored():
    apply_event(event("Paused", {}))  # must not raise
