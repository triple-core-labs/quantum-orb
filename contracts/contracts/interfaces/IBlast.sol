// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IBlast {
    function configureAutomaticYield() external;
    function configureClaimableGas() external;
    function configureGovernor(address governor) external;
    function claimMaxGas(address contractAddress, address recipient)
        external
        returns (uint256);
}
