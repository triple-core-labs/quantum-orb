import pytest
from rest_framework.test import APIClient

from backend.leaderboard.models import OrbOpen, OrbType, Player

pytestmark = pytest.mark.django_db

ALICE = "0x00000000000000000000000000000000000000a1"
BOB = "0x00000000000000000000000000000000000000b2"


@pytest.fixture
def api():
    return APIClient()


def make_open(player, points, block, log_index=0, commit_block=0, rank=1):
    return OrbOpen.objects.create(
        tx_hash=f"0x{block:064x}",
        log_index=log_index,
        commit_block=commit_block or block - 3,
        player=player,
        orb_type=OrbType.GENESIS,
        rank=rank,
        points=points,
        block_number=block,
        block_timestamp=1_700_000_000 + block,
    )


def test_activity_is_newest_first(api):
    alice = Player.objects.create(address=ALICE)
    make_open(alice, 100, 10)
    make_open(alice, 200, 20)

    opens = api.get("/api/activity").json()["opens"]

    assert [row["points"] for row in opens] == [200, 100]


def test_activity_carries_the_blocks_needed_to_verify(api):
    alice = Player.objects.create(address=ALICE)
    make_open(alice, 100, 10, commit_block=7)

    row = api.get("/api/activity").json()["opens"][0]

    assert row["commitBlock"] == 7
    assert row["revealBlock"] == 10
    assert row["txHash"].startswith("0x")


def test_stats_sum_the_whole_table(api):
    alice = Player.objects.create(address=ALICE)
    Player.objects.create(address=BOB)
    make_open(alice, 100, 10)
    make_open(alice, 900, 20)

    body = api.get("/api/stats").json()

    assert body["players"] == 2
    assert body["orbsOpened"] == 2
    assert body["pointsAwarded"] == 1000
    assert body["biggestOpen"] == 900


def test_stats_are_zero_on_an_empty_table(api):
    body = api.get("/api/stats").json()
    assert body == {
        "players": 0,
        "orbsOpened": 0,
        "pointsAwarded": 0,
        "biggestOpen": 0,
    }


def test_referrers_rank_by_points_earned(api):
    alice = Player.objects.create(address=ALICE, referral_points=500)
    Player.objects.create(address=BOB, referrer=alice)

    rows = api.get("/api/referrers").json()["referrers"]

    assert rows[0]["address"] == ALICE
    assert rows[0]["invited"] == 1
    assert rows[0]["referralPoints"] == 500


def test_referrers_skip_players_who_invited_nobody(api):
    Player.objects.create(address=ALICE, referral_points=500)
    assert api.get("/api/referrers").json()["referrers"] == []


def test_player_opens_lists_only_that_player(api):
    alice = Player.objects.create(address=ALICE)
    bob = Player.objects.create(address=BOB)
    make_open(alice, 100, 10)
    make_open(bob, 800, 20)

    opens = api.get(f"/api/players/{ALICE}/opens").json()["opens"]

    assert len(opens) == 1
    assert opens[0]["points"] == 100


def test_player_opens_is_404_for_an_unknown_address(api):
    assert api.get(f"/api/players/{ALICE}/opens").status_code == 404


def test_player_opens_rejects_a_malformed_address(api):
    assert api.get("/api/players/nope/opens").status_code == 400


def test_player_detail_exposes_the_streak(api):
    Player.objects.create(address=ALICE, daily_streak=4)
    assert api.get(f"/api/players/{ALICE}").json()["dailyStreak"] == 4
