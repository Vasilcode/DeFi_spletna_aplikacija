import { parseAbi } from 'viem';

export const stakingAbi = parseAbi([
	'function stake(uint256 amount)',
	'function stakedBalance(address) view returns (uint256)',
]);
