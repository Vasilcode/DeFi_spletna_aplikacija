// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingContract is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public immutable rewardRatePerSecond;
    uint256 public totalStaked;
    uint256 private constant PRECISION = 1e18;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public lastUpdateTime;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    error InvalidAmount();
    error InsufficientStakedBalance();
    error NoRewardsToClaim();
    error InsufficientRewardPool();

    constructor(address stakingToken_, uint256 rewardRatePerSecond_) {
        require(stakingToken_ != address(0), "Invalid staking token");
        stakingToken = IERC20(stakingToken_);
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    function _updateRewards(address user) internal {
        uint256 lastTime = lastUpdateTime[user];

        if (lastTime != 0) {
            uint256 elapsed = block.timestamp - lastTime;
            uint256 reward = (stakedBalance[user] *
                rewardRatePerSecond *
                elapsed) / PRECISION;
            pendingRewards[user] += reward;
        }

        lastUpdateTime[user] = block.timestamp;
    }

    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        _updateRewards(msg.sender);

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        stakedBalance[msg.sender] += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (stakedBalance[msg.sender] < amount)
            revert InsufficientStakedBalance();

        _updateRewards(msg.sender);

        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);

        uint256 reward = pendingRewards[msg.sender];
        if (reward == 0) revert NoRewardsToClaim();

        uint256 availableRewardPool = stakingToken.balanceOf(address(this)) -
            totalStaked;
        if (availableRewardPool < reward) revert InsufficientRewardPool();

        pendingRewards[msg.sender] = 0;

        stakingToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }
}
