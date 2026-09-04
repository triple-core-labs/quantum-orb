"""Submit revealOrb for orbs whose commit block is old enough."""

import logging
import time

from django.conf import settings
from django.db import connection

from backend.leaderboard.models import PendingOrb

log = logging.getLogger(__name__)

POLL_SECONDS = 3

SUBMIT_COOLDOWN_BLOCKS = 10
ADVISORY_LOCK_KEY = 0x510B0BB5


class RelayerError(RuntimeError):
    pass


def due_orbs(head: int, reveal_delay: int):
    """Orbs whose reveal block is strictly in the past."""
    return PendingOrb.objects.filter(commit_block__lt=head - reveal_delay).order_by(
        "commit_block"
    )


def to_submit(head: int, reveal_delay: int, submitted: dict[str, int]):
    """Due orbs we have not submitted a reveal for in the last few blocks."""
    for orb in due_orbs(head, reveal_delay):
        last = submitted.get(orb.player_id)
        if last is not None and head - last < SUBMIT_COOLDOWN_BLOCKS:
            continue
        yield orb


def is_already_revealed(error: Exception) -> bool:
    """True when the revert means somebody else revealed first."""
    return "NoPendingOpen" in str(error)


def acquire_singleton_lock() -> bool:
    """Only one relayer may hold the nonce for the hot wallet."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT pg_try_advisory_lock(%s)", [ADVISORY_LOCK_KEY])
        return cursor.fetchone()[0]


def reveal(contract, account, address: str) -> str | None:
    web3 = contract.w3
    try:
        tx = contract.functions.revealOrb(
            web3.to_checksum_address(address)
        ).build_transaction(
            {
                "from": account.address,
                "nonce": web3.eth.get_transaction_count(account.address),
                "chainId": settings.CHAIN_ID,
            }
        )
        signed = account.sign_transaction(tx)
        tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
    except Exception as exc:  # noqa: BLE001
        if is_already_revealed(exc):
            log.info("reveal for %s already settled elsewhere", address)
            return None
        raise RelayerError(f"reveal failed for {address}: {exc}") from exc


def run_forever(contract, web3, account) -> None:
    if not acquire_singleton_lock():
        raise RelayerError("another relayer holds the lock; run exactly one instance")

    reveal_delay = contract.functions.REVEAL_DELAY().call()
    reveal_window = contract.functions.REVEAL_WINDOW().call()
    log.info("relayer started as %s", account.address)

    submitted: dict[str, int] = {}
    backoff = POLL_SECONDS
    while True:
        try:
            head = web3.eth.block_number
            for orb in to_submit(head, reveal_delay, submitted):
                age = head - orb.commit_block
                if age > reveal_window:
                    log.error(
                        "orb for %s expired unrevealed at age %s blocks",
                        orb.player_id,
                        age,
                    )
                    continue
                if age > reveal_window // 2:
                    log.warning(
                        "orb for %s is %s blocks old, window is %s",
                        orb.player_id,
                        age,
                        reveal_window,
                    )
                submitted[orb.player_id] = head
                reveal(contract, account, orb.player_id)
            backoff = POLL_SECONDS
        except RelayerError as exc:
            log.error("%s", exc)
            backoff = min(backoff * 2, 60)
        time.sleep(backoff)
