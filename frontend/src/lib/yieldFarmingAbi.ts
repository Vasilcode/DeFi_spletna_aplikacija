import { parseAbi } from 'viem';

export const yieldFarmingAbi = parseAbi([
	'function lpToken() view returns (address)',
	'function rewardToken() view returns (address)',
	'function stake(uint256 amount)',
	'function unstake(uint256 amount)',
	'function claimRewards()',
	'function stakedBalance(address) view returns (uint256)',
	'function pendingRewards(address) view returns (uint256)',
]);
