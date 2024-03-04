// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {QuantumOrb} from "../QuantumOrb.sol";

/// @dev Refuses every incoming transfer. Used to prove that a refund or a
///      withdrawal to an address that reverts surfaces as TransferFailed
///      rather than silently succeeding.
contract RejectingReceiver {
    QuantumOrb public immutable orb;

    constructor(QuantumOrb _orb) {
        orb = _orb;
    }

    function open(uint8 orbType) external payable {
        orb.openOrb{value: msg.value}(QuantumOrb.OrbType(orbType), address(0));
    }

    function reclaim() external {
        orb.reclaimOrb();
    }

    receive() external payable {
        revert("no thanks");
    }
}

/// @dev Re-enters reclaimOrb from inside the refund transfer. Proves the
///      nonReentrant guard fires; the inner revert then makes the outer
///      refund fail with TransferFailed.
contract ReentrantReceiver {
    QuantumOrb public immutable orb;

    constructor(QuantumOrb _orb) {
        orb = _orb;
    }

    function open(uint8 orbType) external payable {
        orb.openOrb{value: msg.value}(QuantumOrb.OrbType(orbType), address(0));
    }

    function reclaim() external {
        orb.reclaimOrb();
    }

    receive() external payable {
        orb.reclaimOrb();
    }
}
