import { parseAbi } from 'viem';

export const liquidityPoolAbi = parseAbi([
	'function lpToken() view returns (address)',
	'function addLiquidityExact(uint256 amountA, uint256 amountB) returns (uint256 liquidityMinted)',
	'function removeLiquidity(uint256 liquidity) returns (uint256 amountA, uint256 amountB)',
	'function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) returns (uint256 amountOut)',
]);
