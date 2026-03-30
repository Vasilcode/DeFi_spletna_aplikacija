// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YieldFarming is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable lpToken;
    IERC20 public immutable rewardToken;
    uint256 public immutable rewardRatePerSecond;
    uint256 public totalStaked;
    uint256 public reservedRewards;
    uint256 public rewardsAvailableFrom;
    uint256 private constant PRECISION = 1e18;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public lastUpdateTime;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsFunded(address indexed funder, uint256 amount);

    error InvalidAmount();
    error InsufficientStakedBalance();
    error NoRewardsToClaim();
    error InvalidRewardRate();
    error UnsupportedTokenBehavior();

    constructor(
        address lpToken_,
        address rewardToken_,
        uint256 rewardRatePerSecond_
    ) {
        require(lpToken_ != address(0), "Invalid LP token");
        require(rewardToken_ != address(0), "Invalid reward token");
        require(lpToken_ != rewardToken_, "Tokens must differ");
        if (rewardRatePerSecond_ == 0) revert InvalidRewardRate();

        lpToken = IERC20(lpToken_);
        rewardToken = IERC20(rewardToken_);
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    function _availableRewardPool() internal view returns (uint256) {
        return rewardToken.balanceOf(address(this)) - reservedRewards;
    }

    function _updateRewards(address user) internal {
        uint256 lastTime = lastUpdateTime[user];

        if (lastTime != 0) {
            uint256 accrualStart = lastTime;
            if (accrualStart < rewardsAvailableFrom) {
                accrualStart = rewardsAvailableFrom;
            }

            if (block.timestamp > accrualStart) {
                uint256 elapsed = block.timestamp - accrualStart;
                uint256 reward = (stakedBalance[user] *
                    rewardRatePerSecond *
                    elapsed) / PRECISION;
                uint256 availableRewardPool = _availableRewardPool();

                if (reward > availableRewardPool) {
                    reward = availableRewardPool;
                }

                if (reward != 0) {
                    pendingRewards[user] += reward;
                    reservedRewards += reward;
                }
            }
        }

        lastUpdateTime[user] = block.timestamp;
    }

    function fundRewards(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        bool wasEmpty = _availableRewardPool() == 0;
        uint256 balanceBefore = rewardToken.balanceOf(address(this));

        rewardToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 received = rewardToken.balanceOf(address(this)) - balanceBefore;
        if (received != amount) revert UnsupportedTokenBehavior();

        if (wasEmpty) {
            rewardsAvailableFrom = block.timestamp;
        }

        emit RewardsFunded(msg.sender, received);
    }

    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        _updateRewards(msg.sender);

        lpToken.safeTransferFrom(msg.sender, address(this), amount);

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

        lpToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);

        uint256 reward = pendingRewards[msg.sender];
        if (reward == 0) revert NoRewardsToClaim();

        pendingRewards[msg.sender] = 0;
        reservedRewards -= reward;

        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }
}
