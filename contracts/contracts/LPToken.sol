// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken is ERC20 {
    address public immutable pool;

    error OnlyPool();

    constructor(address pool_) ERC20("Liquidity Provider Token", "LPT") {
        require(pool_ != address(0), "Invalid pool");
        pool = pool_;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != pool) revert OnlyPool();
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != pool) revert OnlyPool();
        _burn(from, amount);
    }
}
