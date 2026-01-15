// SPDX-License-Identifier: MIT-0
pragma solidity ^0.8.20;

contract SignalAnchor {
    uint256 private deployedAt;

    constructor() {
        deployedAt = block.timestamp;
    }

    function deploymentTimestamp() external view returns (uint256) {
        return deployedAt;
    }

    function currentBlock() external view returns (uint256) {
        return block.number;
    }
}
