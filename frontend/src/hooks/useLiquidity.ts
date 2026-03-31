import { useMemo } from 'react';
import { formatUnits, parseUnits, type Address } from 'viem';
import {
	useAccount,
	useReadContract,
	useWaitForTransactionReceipt,
	useWriteContract,
} from 'wagmi';
import { contracts } from '../lib/contracts';
import { erc20Abi } from '../lib/erc20Abi';
import { liquidityPoolAbi } from '../lib/liquidityPoolAbi';
import { liquidityPoolReadAbi } from '../lib/liquidityPoolReadAbi';

function sqrt(value: bigint) {
	if (value < 2n) {
		return value;
	}

	let x0 = value;
	let x1 = (value >> 1n) + 1n;

	while (x1 < x0) {
		x0 = x1;
		x1 = ((value / x1) + x1) >> 1n;
	}

	return x0;
}

export function useLiquidity(amountA: string, amountB: string) {
	const { address } = useAccount();

	const tokenADecimalsQuery = useReadContract({
		address: contracts.token,
		abi: erc20Abi,
		functionName: 'decimals',
	});

	const tokenBDecimalsQuery = useReadContract({
		address: contracts.tokenB,
		abi: erc20Abi,
		functionName: 'decimals',
	});

	const tokenADecimals = tokenADecimalsQuery.data ?? 18;
	const tokenBDecimals = tokenBDecimalsQuery.data ?? 18;

	const parsedAmountA = useMemo(() => {
		if (!amountA.trim()) return undefined;
		try {
			return parseUnits(amountA, tokenADecimals);
		} catch {
			return undefined;
		}
	}, [amountA, tokenADecimals]);

	const parsedAmountB = useMemo(() => {
		if (!amountB.trim()) return undefined;
		try {
			return parseUnits(amountB, tokenBDecimals);
		} catch {
			return undefined;
		}
	}, [amountB, tokenBDecimals]);

	const tokenABalanceQuery = useReadContract({
		address: contracts.token,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: Boolean(address), refetchInterval: 2000 },
	});

	const tokenBBalanceQuery = useReadContract({
		address: contracts.tokenB,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: Boolean(address), refetchInterval: 2000 },
	});

	const allowanceAQuery = useReadContract({
		address: contracts.token,
		abi: erc20Abi,
		functionName: 'allowance',
		args: address ? [address, contracts.pool] : undefined,
		query: { enabled: Boolean(address), refetchInterval: 2000 },
	});

	const allowanceBQuery = useReadContract({
		address: contracts.tokenB,
		abi: erc20Abi,
		functionName: 'allowance',
		args: address ? [address, contracts.pool] : undefined,
		query: { enabled: Boolean(address), refetchInterval: 2000 },
	});

	const reservesQuery = useReadContract({
		address: contracts.pool,
		abi: liquidityPoolReadAbi,
		functionName: 'getReserves',
		query: { refetchInterval: 2000 },
	});

	const lpTokenAddressQuery = useReadContract({
		address: contracts.pool,
		abi: liquidityPoolAbi,
		functionName: 'lpToken',
	});

	const lpTokenAddress = lpTokenAddressQuery.data as Address | undefined;

	const lpTokenSupplyQuery = useReadContract({
		address: lpTokenAddress,
		abi: erc20Abi,
		functionName: 'totalSupply',
		query: { enabled: Boolean(lpTokenAddress), refetchInterval: 2000 },
	});

	const userLpBalanceQuery = useReadContract({
		address: lpTokenAddress,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: Boolean(address && lpTokenAddress), refetchInterval: 2000 },
	});

	const {
		writeContract: writeApproveA,
		data: approveAHash,
		isPending: isApproveAPending,
		error: approveAError,
	} = useWriteContract();

	const {
		writeContract: writeApproveB,
		data: approveBHash,
		isPending: isApproveBPending,
		error: approveBError,
	} = useWriteContract();

	const {
		writeContract: writeAddLiquidity,
		data: addLiquidityHash,
		isPending: isAddLiquidityPending,
		error: addLiquidityError,
	} = useWriteContract();

	const { isLoading: isApproveAConfirming, error: approveAReceiptError } = useWaitForTransactionReceipt({
		hash: approveAHash,
	});

	const { isLoading: isApproveBConfirming, error: approveBReceiptError } = useWaitForTransactionReceipt({
		hash: approveBHash,
	});

	const { isLoading: isAddLiquidityConfirming, error: addLiquidityReceiptError } = useWaitForTransactionReceipt({
		hash: addLiquidityHash,
	});

	const allowanceA = allowanceAQuery.data;
	const allowanceB = allowanceBQuery.data;
	const tokenABalance = tokenABalanceQuery.data;
	const tokenBBalance = tokenBBalanceQuery.data;
	const reserves = reservesQuery.data as readonly [bigint, bigint] | undefined;
	const lpTotalSupply = lpTokenSupplyQuery.data;
	const userLpBalance = userLpBalanceQuery.data;

	const reserveA = reserves?.[0];
	const reserveB = reserves?.[1];

	const estimatedLpMinted = useMemo(() => {
		if (parsedAmountA === undefined || parsedAmountB === undefined) {
			return undefined;
		}

		if (!lpTotalSupply || lpTotalSupply === 0n) {
			return sqrt(parsedAmountA * parsedAmountB);
		}

		if (!reserveA || !reserveB || reserveA === 0n || reserveB === 0n) {
			return undefined;
		}

		const liquidityFromA = (parsedAmountA * lpTotalSupply) / reserveA;
		const liquidityFromB = (parsedAmountB * lpTotalSupply) / reserveB;
		return liquidityFromA < liquidityFromB ? liquidityFromA : liquidityFromB;
	}, [parsedAmountA, parsedAmountB, lpTotalSupply, reserveA, reserveB]);

	const projectedShareBps = useMemo(() => {
		if (
			estimatedLpMinted === undefined ||
			lpTotalSupply === undefined ||
			userLpBalance === undefined
		) {
			return undefined;
		}

		const projectedTotalSupply = lpTotalSupply + estimatedLpMinted;
		if (projectedTotalSupply === 0n) {
			return undefined;
		}

		return ((userLpBalance + estimatedLpMinted) * 10_000n) / projectedTotalSupply;
	}, [estimatedLpMinted, lpTotalSupply, userLpBalance]);

	const poolRatio = useMemo(() => {
		if (reserveA === undefined || reserveB === undefined || reserveA === 0n) {
			return undefined;
		}

		return Number(formatUnits(reserveB, tokenBDecimals)) / Number(formatUnits(reserveA, tokenADecimals));
	}, [reserveA, reserveB, tokenADecimals, tokenBDecimals]);

	const needsApprovalA =
		parsedAmountA !== undefined &&
		allowanceA !== undefined &&
		allowanceA < parsedAmountA;

	const needsApprovalB =
		parsedAmountB !== undefined &&
		allowanceB !== undefined &&
		allowanceB < parsedAmountB;

	const canAddLiquidity =
		parsedAmountA !== undefined &&
		parsedAmountB !== undefined &&
		!needsApprovalA &&
		!needsApprovalB;
	const errorMessage =
		addLiquidityReceiptError?.message ||
		addLiquidityError?.message ||
		approveBReceiptError?.message ||
		approveBError?.message ||
		approveAReceiptError?.message ||
		approveAError?.message;

	function approveA() {
		if (!parsedAmountA) return;

		writeApproveA({
			address: contracts.token,
			abi: erc20Abi,
			functionName: 'approve',
			args: [contracts.pool, parsedAmountA],
		});
	}

	function approveB() {
		if (!parsedAmountB) return;

		writeApproveB({
			address: contracts.tokenB,
			abi: erc20Abi,
			functionName: 'approve',
			args: [contracts.pool, parsedAmountB],
		});
	}

	function addLiquidity() {
		if (!parsedAmountA || !parsedAmountB) return;

		writeAddLiquidity({
			address: contracts.pool,
			abi: liquidityPoolAbi,
			functionName: 'addLiquidityExact',
			args: [parsedAmountA, parsedAmountB],
		});
	}

	return {
		isAmountAValid: parsedAmountA !== undefined,
		isAmountBValid: parsedAmountB !== undefined,
		tokenABalanceFormatted:
			tokenABalance !== undefined
				? formatUnits(tokenABalance, tokenADecimals)
				: undefined,
		tokenBBalanceFormatted:
			tokenBBalance !== undefined
				? formatUnits(tokenBBalance, tokenBDecimals)
				: undefined,
		allowanceAFormatted:
			allowanceA !== undefined
				? formatUnits(allowanceA, tokenADecimals)
				: undefined,
		allowanceBFormatted:
			allowanceB !== undefined
				? formatUnits(allowanceB, tokenBDecimals)
				: undefined,
		lpBalanceFormatted:
			userLpBalance !== undefined ? formatUnits(userLpBalance, tokenADecimals) : undefined,
		estimatedLpMintedFormatted:
			estimatedLpMinted !== undefined
				? formatUnits(estimatedLpMinted, tokenADecimals)
				: undefined,
		projectedSharePercent:
			projectedShareBps !== undefined
				? `${(Number(projectedShareBps) / 100).toFixed(2)}%`
				: undefined,
		poolRatioDisplay:
			poolRatio !== undefined ? `1 Token A ≈ ${poolRatio.toFixed(4)} Token B` : undefined,
		errorMessage,
		needsApprovalA,
		needsApprovalB,
		canAddLiquidity,
		approveA,
		approveB,
		addLiquidity,
		isApproveAPending,
		isApproveAConfirming,
		isApproveBPending,
		isApproveBConfirming,
		isAddLiquidityPending,
		isAddLiquidityConfirming,
	};
}
