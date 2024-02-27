// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IBlast} from "../interfaces/IBlast.sol";

/// @dev Test double for the Blast precompile. Its runtime code is installed at
///      0x4300...0002 by test/helpers/blast.ts. Holds no state, because
///      hardhat_setCode copies code without storage.
contract MockBlast is IBlast {
    function configureAutomaticYield() external {}

    function configureClaimableGas() external {}

    function configureGovernor(address) external {}

    function claimMaxGas(address, address) external pure returns (uint256) {
        return 0;
    }
}
