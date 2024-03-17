"""Access to the QuantumOrb contract.

The ABI is read from the artifact the contract build exports. The backend
never keeps its own copy: three hand-maintained copies are what let the
subgraph drift into indexing an event the contract had stopped declaring.
"""

import json
from functools import lru_cache

from django.conf import settings
from web3 import Web3

EVENT_NAMES = {
    "UserRegistered",
    "OrbCommitted",
    "OrbOpened",
    "OrbExpired",
    "PointsCredited",
}


def load_abi() -> list:
    path = settings.CONTRACT_ABI_PATH
    try:
        payload = json.loads(path.read_text())
    except FileNotFoundError as exc:
        raise RuntimeError(
            f"Contract ABI not found at {path}. Run `npm run export-abi` in "
            f"contracts/ and make sure contracts/abi is mounted."
        ) from exc

    abi = payload["abi"]
    declared = {e["name"] for e in abi if e["type"] == "event"}
    missing = EVENT_NAMES - declared
    if missing:
        raise RuntimeError(
            f"ABI at {path} is missing events the indexer needs: " f"{sorted(missing)}"
        )
    return abi


@lru_cache(maxsize=1)
def get_web3() -> Web3:
    return Web3(Web3.HTTPProvider(settings.RPC_URL))


def get_contract():
    if not settings.CONTRACT_ADDRESS:
        raise RuntimeError("CONTRACT_ADDRESS must be set in the environment")
    return get_web3().eth.contract(
        address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
        abi=load_abi(),
    )
