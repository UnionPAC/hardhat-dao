// SPDX-License-Identifier: MIT

// what is the purpose of this timelock? --> we want to wait for a new vote to be 'executed"
// gives time to users to 'get out' if they don't like the governance direction

import "@openzeppelin/contracts/governance/TimelockController.sol";

pragma solidity 0.8.17;

contract TimeLock is TimelockController {
  constructor(
    uint256 minDelay, // how long you have to wait before executing
    address[] memory proposers, // the list of people who can propose
    address[] memory executors // the list of people who can execute when a proposal passes
  ) TimelockController(minDelay, proposers, executors) {}
}
