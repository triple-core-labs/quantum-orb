// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {QuantumOrb} from "../QuantumOrb.sol";

contract RankHarness is QuantumOrb {
    function rank(uint256 seed) public pure returns (uint8) {
        return _rank(seed);
    }

    function countsByRank() external pure returns (uint256[4] memory tally) {
        for (uint256 roll = 0; roll < 10_000; ++roll) {
            tally[rank(roll) - 1] += 1;
        }
    }
}
