import pytest

from backend.leaderboard.models import Player
from backend.leaderboard.queries import player_rank, top, window_around

pytestmark = pytest.mark.django_db


def make(address, points):
    return Player.objects.create(address=address, points=points)


def test_top_is_ordered_by_points_descending():
    make("0xa", 10)
    make("0xb", 30)
    make("0xc", 20)

    rows = top(limit=3)

    assert [r["address"] for r in rows] == ["0xb", "0xc", "0xa"]
    assert [r["rank"] for r in rows] == [1, 2, 3]


def test_top_respects_the_limit():
    for i in range(30):
        make(f"0x{i:02x}", i)
    assert len(top(limit=20)) == 20


def test_tied_scores_share_a_rank():
    make("0xa", 50)
    make("0xb", 50)
    make("0xc", 10)

    ranks = {r["address"]: r["rank"] for r in top(limit=3)}

    assert ranks["0xa"] == ranks["0xb"] == 1
    # RANK leaves a gap after a tie, so the next player is third.
    assert ranks["0xc"] == 3


def test_player_rank_reflects_position():
    make("0xa", 10)
    make("0xb", 30)
    assert player_rank("0xb") == 1
    assert player_rank("0xa") == 2


def test_player_rank_is_none_for_an_unknown_address():
    assert player_rank("0xdoesnotexist") is None


def test_window_includes_the_player_and_neighbours():
    for i in range(20):
        make(f"0x{i:02x}", i * 10)

    rows = window_around("0x0a", size=2)
    addresses = [r["address"] for r in rows]

    assert "0x0a" in addresses
    assert len(rows) == 5  # two above, the player, two below


def test_window_does_not_truncate_at_the_player():
    # The previous getTop broke out of its loop on the requested address,
    # cutting the list short instead of centring on it.
    for i in range(10):
        make(f"0x{i:02x}", i * 10)

    rows = window_around("0x00", size=3)

    assert rows[-1]["address"] == "0x00"
    assert len(rows) == 4


def test_window_is_empty_for_an_unknown_address():
    make("0xa", 10)
    assert window_around("0xnope") == []
