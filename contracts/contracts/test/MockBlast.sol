// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IBlast} from "../interfaces/IBlast.sol";

contract MockBlast is IBlast {
    function configureAutomaticYield() external {}

    function configureClaimableGas() external {}

    function configureGovernor(address) external {}

    function claimMaxGas(address, address) external pure returns (uint256) {
        return 0;
    }
}
