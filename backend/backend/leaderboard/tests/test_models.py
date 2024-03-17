import pytest
from django.db import IntegrityError

from backend.leaderboard.models import (
    IndexerState,
    OrbOpen,
    OrbType,
    PendingOrb,
    Player,
)

pytestmark = pytest.mark.django_db


def test_player_address_is_the_primary_key():
    p = Player.objects.create(address="0xabc")
    assert Player.objects.get(pk="0xabc") == p


def test_player_defaults_are_zero():
    p = Player.objects.create(address="0xabc")
    assert p.points == 0
    assert p.referral_points == 0
    assert p.referrer is None
    assert p.is_partner is False


def test_referrer_is_a_self_reference():
    alice = Player.objects.create(address="0xa")
    bob = Player.objects.create(address="0xb", referrer=alice)
    assert bob.referrer == alice
    assert list(alice.referrals.all()) == [bob]


def test_orb_open_is_unique_per_log_entry():
    p = Player.objects.create(address="0xa")
    kwargs = dict(
        tx_hash="0xdead",
        log_index=0,
        player=p,
        orb_type=OrbType.DAILY,
        rank=1,
        points=42,
        block_number=100,
        block_timestamp=0,
    )
    OrbOpen.objects.create(**kwargs)
    with pytest.raises(IntegrityError):
        OrbOpen.objects.create(**kwargs)


def test_pending_orb_is_one_per_player():
    p = Player.objects.create(address="0xa")
    PendingOrb.objects.create(player=p, orb_type=OrbType.GENESIS, commit_block=10)
    with pytest.raises(IntegrityError):
        PendingOrb.objects.create(player=p, orb_type=OrbType.DAILY, commit_block=11)


def test_indexer_state_is_a_singleton():
    a = IndexerState.load()
    b = IndexerState.load()
    assert a.pk == b.pk
    assert IndexerState.objects.count() == 1


def test_orb_type_values_match_the_solidity_enum():
    assert OrbType.DAILY == 0
    assert OrbType.GENESIS == 1
    assert OrbType.QUANTUM == 2
