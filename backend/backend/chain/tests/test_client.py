import json

import pytest

from backend.chain.client import EVENT_NAMES, load_abi


def test_load_abi_returns_the_contract_events():
    abi = load_abi()
    events = {e["name"] for e in abi if e["type"] == "event"}
    assert EVENT_NAMES <= events


def test_load_abi_rejects_an_abi_without_orb_opened(tmp_path, settings):
    stripped = tmp_path / "QuantumOrb.json"
    stripped.write_text(json.dumps({"abi": [{"type": "event", "name": "Nope"}]}))
    settings.CONTRACT_ABI_PATH = stripped

    with pytest.raises(RuntimeError, match="OrbOpened"):
        load_abi()


def test_load_abi_reports_a_missing_artifact(tmp_path, settings):
    settings.CONTRACT_ABI_PATH = tmp_path / "absent.json"
    with pytest.raises(RuntimeError, match="export-abi"):
        load_abi()


def test_event_names_cover_what_the_indexer_handles():
    assert EVENT_NAMES == {
        "UserRegistered",
        "OrbCommitted",
        "OrbOpened",
        "OrbExpired",
        "PointsCredited",
    }
