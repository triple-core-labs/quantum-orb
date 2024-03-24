import pytest
from rest_framework.test import APIClient

from backend.leaderboard.models import OrbType, PendingOrb, Player

pytestmark = pytest.mark.django_db

ALICE = "0x00000000000000000000000000000000000000a1"
BOB = "0x00000000000000000000000000000000000000b2"


@pytest.fixture
def api():
    return APIClient()


def test_config_exposes_chain_settings(api, settings):
    settings.CONTRACT_ADDRESS = "0x" + "1" * 40
    response = api.get("/api/config")
    assert response.status_code == 200
    body = response.json()
    assert body["chainId"] == settings.CHAIN_ID
    assert body["contractAddress"] == settings.CONTRACT_ADDRESS


def test_config_survives_an_unreachable_rpc(api, settings):
    settings.RPC_URL = "http://127.0.0.1:1"
    assert api.get("/api/config").status_code == 200


def test_leaderboard_returns_top_without_an_address(api):
    Player.objects.create(address=ALICE, points=100)
    response = api.get("/api/leaderboard")
    assert response.status_code == 200
    assert response.json()["top"][0]["address"] == ALICE
    assert response.json()["around"] == []


def test_leaderboard_includes_a_window_for_a_known_address(api):
    for i in range(30):
        Player.objects.create(address=f"0x{i:040x}", points=i)
    target = f"0x{5:040x}"

    response = api.get(f"/api/leaderboard?address={target}")

    around = [row["address"] for row in response.json()["around"]]
    assert target in around


def test_leaderboard_rejects_a_malformed_address(api):
    response = api.get("/api/leaderboard?address=not-an-address")
    assert response.status_code == 400


def test_player_detail_returns_totals_and_rank(api):
    Player.objects.create(address=ALICE, points=500, referral_points=50)
    response = api.get(f"/api/players/{ALICE}")
    body = response.json()
    assert response.status_code == 200
    assert body["points"] == 500
    assert body["referralPoints"] == 50
    assert body["rank"] == 1


def test_player_detail_is_404_for_an_unknown_address(api):
    assert api.get(f"/api/players/{ALICE}").status_code == 404


def test_player_detail_accepts_a_checksummed_address(api):
    Player.objects.create(address=ALICE, points=1)
    mixed = "0x" + ALICE[2:].upper()
    assert api.get(f"/api/players/{mixed}").status_code == 200


def test_referrals_lists_referred_players(api):
    alice = Player.objects.create(address=ALICE, points=10)
    Player.objects.create(address=BOB, points=20, referrer=alice)

    body = api.get(f"/api/players/{ALICE}/referrals").json()

    assert body["count"] == 1
    assert body["referrals"][0]["address"] == BOB


def test_pending_returns_null_when_there_is_none(api):
    Player.objects.create(address=ALICE)
    response = api.get(f"/api/players/{ALICE}/pending")
    assert response.status_code == 200
    assert response.json()["pending"] is None


def test_pending_describes_a_committed_orb(api):
    alice = Player.objects.create(address=ALICE)
    PendingOrb.objects.create(player=alice, orb_type=OrbType.QUANTUM, commit_block=42)

    body = api.get(f"/api/players/{ALICE}/pending").json()["pending"]

    assert body["orbType"] == OrbType.QUANTUM
    assert body["commitBlock"] == 42


def test_there_are_no_write_endpoints(api):
    assert api.post("/api/leaderboard", {}).status_code in (403, 405)
    assert api.delete(f"/api/players/{ALICE}").status_code in (403, 404, 405)
