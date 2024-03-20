import pytest

from backend.leaderboard.models import OrbType, PendingOrb, Player
from backend.leaderboard.relayer import due_orbs, is_already_revealed

pytestmark = pytest.mark.django_db

ALICE = "0x00000000000000000000000000000000000000a1"
BOB = "0x00000000000000000000000000000000000000b2"


def pending(address, commit_block):
    player = Player.objects.create(address=address)
    return PendingOrb.objects.create(
        player=player, orb_type=OrbType.DAILY, commit_block=commit_block
    )


def test_an_orb_is_not_due_before_the_delay():
    pending(ALICE, commit_block=100)
    assert list(due_orbs(head=101, reveal_delay=2)) == []


def test_an_orb_is_not_due_in_the_delay_block_itself():
    pending(ALICE, commit_block=100)
    # The contract's guard is strict, because blockhash of the current block
    # is zero; reveal is legal from commitBlock + delay + 1.
    assert list(due_orbs(head=102, reveal_delay=2)) == []


def test_an_orb_is_due_once_the_delay_block_is_in_the_past():
    orb = pending(ALICE, commit_block=100)
    assert list(due_orbs(head=103, reveal_delay=2)) == [orb]


def test_orbs_are_returned_oldest_first():
    younger = pending(ALICE, commit_block=200)
    older = pending(BOB, commit_block=100)
    assert list(due_orbs(head=500, reveal_delay=2)) == [older, younger]


def test_already_revealed_recognises_the_contract_error():
    assert is_already_revealed(Exception("execution reverted: NoPendingOpen"))
    assert is_already_revealed(Exception("NoPendingOpen()"))
    assert not is_already_revealed(Exception("insufficient funds for gas"))


def test_recently_submitted_orbs_are_skipped():
    from backend.leaderboard.relayer import SUBMIT_COOLDOWN_BLOCKS, to_submit

    pending(ALICE, commit_block=100)
    submitted: dict[str, int] = {}

    first = list(to_submit(head=103, reveal_delay=2, submitted=submitted))
    assert len(first) == 1

    submitted[ALICE] = 103
    # The pending row survives until the indexer sees OrbOpened; without a
    # cooldown the relayer re-estimates the same reveal on every poll.
    again = list(to_submit(head=104, reveal_delay=2, submitted=submitted))
    assert again == []

    later = list(
        to_submit(
            head=103 + SUBMIT_COOLDOWN_BLOCKS,
            reveal_delay=2,
            submitted=submitted,
        )
    )
    assert len(later) == 1
