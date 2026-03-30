import { parseAbi } from 'viem';

export const erc20ReadAbi = parseAbi([
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function totalSupply() view returns (uint256)',
]);
