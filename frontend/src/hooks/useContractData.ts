import { useReadContract } from 'wagmi';
import { contracts } from '../lib/contracts';
import { erc20ReadAbi } from '../lib/erc20readAbi';
import { liquidityPoolReadAbi } from '../lib/liquidityPoolReadAbi';

export function useContractsData() {
	const tokenName = useReadContract({
		address: contracts.token,
		abi: erc20ReadAbi,
		functionName: 'name',
	});

	const tokenSymbol = useReadContract({
		address: contracts.token,
		abi: erc20ReadAbi,
		functionName: 'symbol',
	});

	const totalSupply = useReadContract({
		address: contracts.token,
		abi: erc20ReadAbi,
		functionName: 'totalSupply',
	});

	const reserves = useReadContract({
		address: contracts.pool,
		abi: liquidityPoolReadAbi,
		functionName: 'getReserves',
	});

	const poolReserves = reserves.data as readonly [bigint, bigint] | undefined;

	return {
		tokenName: tokenName.data,
		tokenSymbol: tokenSymbol.data,
		totalSupply: totalSupply.data,
		reserveA: poolReserves?.[0],
		reserveB: poolReserves?.[1],
	};
}
