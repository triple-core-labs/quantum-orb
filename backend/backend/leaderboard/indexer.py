"""Read contract logs into the database.

The cursor always trails the chain head by settings.CONFIRMATIONS blocks, and
each cycle re-reads REORG_WINDOW blocks it has already seen. Handlers are
idempotent, so the overlap costs nothing and repairs a shallow reorg without
special-case code.
"""

import logging
import time
from functools import partial

from django.conf import settings

from backend.leaderboard.handlers import apply_event
from backend.leaderboard.models import IndexerState

log = logging.getLogger(__name__)

# Blast reorgs are shallow; twelve blocks is roughly half a minute of history.
REORG_WINDOW = 12

MAX_BLOCKS_PER_SCAN = 2_000
POLL_SECONDS = 4


def scan_range(contract, from_block: int, to_block: int) -> list[dict]:
    """Fetch and normalise every handled event in a block range."""
    from backend.chain.client import EVENT_NAMES

    events: list[dict] = []
    for name in sorted(EVENT_NAMES):
        event_type = getattr(contract.events, name)
        for raw in event_type().get_logs(from_block=from_block, to_block=to_block):
            events.append(
                {
                    "event": name,
                    "args": dict(raw["args"]),
                    "transactionHash": raw["transactionHash"].hex(),
                    "logIndex": raw["logIndex"],
                    "blockNumber": raw["blockNumber"],
                    "blockTimestamp": raw.get("blockTimestamp", 0),
                }
            )

    events.sort(key=lambda e: (e["blockNumber"], e["logIndex"]))
    return events


def process_once(contract, head: int, scan=None) -> int:
    """Index one window. Returns the new cursor position.

    `scan` is injected by tests; by default it is scan_range bound to the
    contract, so callers pass a two-argument (from_block, to_block) callable.
    """
    if scan is None:
        scan = partial(scan_range, contract)

    state = IndexerState.load()
    cursor = state.last_processed_block or settings.CONTRACT_START_BLOCK

    if head <= cursor:
        return cursor

    from_block = max(settings.CONTRACT_START_BLOCK, cursor - REORG_WINDOW + 1)
    to_block = min(head, from_block + MAX_BLOCKS_PER_SCAN - 1)

    for event in scan(from_block, to_block):
        apply_event(event)

    state.last_processed_block = to_block
    state.save(update_fields=["last_processed_block"])
    return to_block


def run_forever(contract, web3) -> None:
    log.info("indexer started")
    while True:
        head = web3.eth.block_number - settings.CONFIRMATIONS
        if head > 0:
            process_once(contract, head)
        time.sleep(POLL_SECONDS)
