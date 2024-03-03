// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {QuantumOrb} from "../QuantumOrb.sol";

/// @dev Exposes QuantumOrb's internal rank logic to tests. Inherits rather
///      than mirrors it, so the distribution test can never pass against a
///      copy that has drifted from the real thresholds.
contract RankHarness is QuantumOrb {
    function rank(uint256 seed) public pure returns (uint8) {
        return _rank(seed);
    }

    /// @dev Exhaustive tally over every residue class, returned in one call.
    ///      tally[0] is rank 1, tally[3] is rank 4.
    function counts() external pure returns (uint256[4] memory tally) {
        for (uint256 roll = 0; roll < 10_000; ++roll) {
            tally[rank(roll) - 1] += 1;
        }
    }
}
