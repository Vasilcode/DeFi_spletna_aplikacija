import { parseAbi } from 'viem';

export const liquidityPoolReadAbi = parseAbi([
	'function getReserves() view returns (uint256, uint256)',
]);
