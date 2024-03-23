// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {QuantumOrb} from "../QuantumOrb.sol";

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
