import pytest

from backend.leaderboard.indexer import REORG_WINDOW, process_once
from backend.leaderboard.models import IndexerState, OrbOpen, Player

pytestmark = pytest.mark.django_db

ALICE = "0x00000000000000000000000000000000000000a1"


class FakeChain:
    """Web3 contract stand-in that records the ranges it was asked for."""

    def __init__(self, events_by_block=None):
        self.events_by_block = events_by_block or {}
        self.requested_ranges = []

    def scan(self, from_block, to_block):
        self.requested_ranges.append((from_block, to_block))
        out = []
        for block, events in sorted(self.events_by_block.items()):
            if from_block <= block <= to_block:
                out.extend(events)
        return out


def opened(block, log_index=0):
    return {
        "event": "OrbOpened",
        "args": {"user": ALICE, "orbType": 0, "rank": 1, "points": 50},
        "transactionHash": f"0x{block:064x}",
        "logIndex": log_index,
        "blockNumber": block,
        "blockTimestamp": 1_700_000_000,
    }


def test_starts_from_the_configured_block(settings):
    settings.CONTRACT_START_BLOCK = 1000
    chain = FakeChain()

    process_once(None, head=1000 + REORG_WINDOW, scan=chain.scan)

    first_from, _ = chain.requested_ranges[0]
    assert first_from == 1000


def test_advances_the_stored_position(settings):
    settings.CONTRACT_START_BLOCK = 0
    chain = FakeChain()

    new_head = process_once(None, head=500, scan=chain.scan)

    assert new_head == 500
    assert IndexerState.load().last_processed_block == 500


def test_indexes_events_in_the_window(settings):
    settings.CONTRACT_START_BLOCK = 0
    chain = FakeChain({100: [opened(100)]})

    process_once(None, head=200, scan=chain.scan)

    assert OrbOpen.objects.count() == 1
    assert Player.objects.filter(address=ALICE).exists()


def test_rescans_a_trailing_window_for_reorgs(settings):
    settings.CONTRACT_START_BLOCK = 0
    chain = FakeChain()

    process_once(None, head=1000, scan=chain.scan)
    process_once(None, head=1100, scan=chain.scan)

    second_from, _ = chain.requested_ranges[1]
    assert second_from == 1000 - REORG_WINDOW + 1


def test_replaying_the_same_events_inserts_nothing_new(settings):
    settings.CONTRACT_START_BLOCK = 0
    chain = FakeChain({100: [opened(100)]})

    process_once(None, head=200, scan=chain.scan)
    process_once(None, head=200, scan=chain.scan)

    assert OrbOpen.objects.count() == 1


def test_does_nothing_when_head_is_behind_the_cursor(settings):
    settings.CONTRACT_START_BLOCK = 0
    chain = FakeChain()

    process_once(None, head=500, scan=chain.scan)
    result = process_once(None, head=400, scan=chain.scan)

    assert result == 500
    assert len(chain.requested_ranges) == 1


def test_caps_the_window_so_one_cycle_cannot_scan_forever(settings):
    from backend.leaderboard.indexer import MAX_BLOCKS_PER_SCAN

    settings.CONTRACT_START_BLOCK = 0
    chain = FakeChain()

    result = process_once(None, head=10 * MAX_BLOCKS_PER_SCAN, scan=chain.scan)

    assert result == MAX_BLOCKS_PER_SCAN - 1
