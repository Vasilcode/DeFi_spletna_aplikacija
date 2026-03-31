import { useEffect, useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import {
	useAccount,
	usePublicClient,
	useReadContract,
	useWaitForTransactionReceipt,
	useWriteContract,
} from 'wagmi';
import { contracts } from '../lib/contracts';
import { erc20Abi } from '../lib/erc20Abi';
import { liquidityPoolAbi } from '../lib/liquidityPoolAbi';
import { liquidityPoolReadAbi } from '../lib/liquidityPoolReadAbi';

type SwapDirection = 'A_TO_B' | 'B_TO_A';

function parseSlippageBps(value: string) {
	if (!value.trim()) {
		return undefined;
	}

	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric < 0 || numeric > 50) {
		return undefined;
	}

	return BigInt(Math.round(numeric * 100));
}

export function useSwap(
	direction: SwapDirection,
	amountIn: string,
	slippagePercent: string,
) {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const [estimatedGas, setEstimatedGas] = useState<bigint | undefined>();

	const tokenInAddress =
		direction === 'A_TO_B' ? contracts.token : contracts.tokenB;
	const tokenOutAddress =
		direction === 'A_TO_B' ? contracts.tokenB : contracts.token;

	const tokenOutLabel = direction === 'A_TO_B' ? 'Token B' : 'Token A';
	const tokenInLabel = direction === 'A_TO_B' ? 'Token A' : 'Token B';

	const inputDecimalsQuery = useReadContract({
		address: tokenInAddress,
		abi: erc20Abi,
		functionName: 'decimals',
	});

	const outputDecimalsQuery = useReadContract({
		address: tokenOutAddress,
		abi: erc20Abi,
		functionName: 'decimals',
	});

	const reservesQuery = useReadContract({
		address: contracts.pool,
		abi: liquidityPoolReadAbi,
		functionName: 'getReserves',
		query: {
			refetchInterval: 2000,
		},
	});

	const inputDecimals = inputDecimalsQuery.data ?? 18;
	const outputDecimals = outputDecimalsQuery.data ?? 18;
	const reserves = reservesQuery.data as readonly [bigint, bigint] | undefined;
	const reserveIn =
		direction === 'A_TO_B' ? reserves?.[0] : reserves?.[1];
	const reserveOut =
		direction === 'A_TO_B' ? reserves?.[1] : reserves?.[0];

	const parsedAmountIn = useMemo(() => {
		if (!amountIn.trim()) return undefined;
		try {
			return parseUnits(amountIn, inputDecimals);
		} catch {
			return undefined;
		}
	}, [amountIn, inputDecimals]);

	const slippageBps = useMemo(
		() => parseSlippageBps(slippagePercent),
		[slippagePercent],
	);
	const isHighSlippage = slippageBps !== undefined && slippageBps > 300n;

	const expectedAmountOut = useMemo(() => {
		if (
			parsedAmountIn === undefined ||
			reserveIn === undefined ||
			reserveOut === undefined ||
			reserveIn === 0n ||
			reserveOut === 0n
		) {
			return undefined;
		}

		return (parsedAmountIn * reserveOut) / (reserveIn + parsedAmountIn);
	}, [parsedAmountIn, reserveIn, reserveOut]);

	const parsedMinAmountOut = useMemo(() => {
		if (expectedAmountOut === undefined || slippageBps === undefined) {
			return undefined;
		}

		return (expectedAmountOut * (10_000n - slippageBps)) / 10_000n;
	}, [expectedAmountOut, slippageBps]);

	const balanceQuery = useReadContract({
		address: tokenInAddress,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(address),
			refetchInterval: 2000,
		},
	});

	const allowanceQuery = useReadContract({
		address: tokenInAddress,
		abi: erc20Abi,
		functionName: 'allowance',
		args: address ? [address, contracts.pool] : undefined,
		query: {
			enabled: Boolean(address),
			refetchInterval: 2000,
		},
	});

	const {
		writeContract: writeApprove,
		data: approveHash,
		isPending: isApprovePending,
		error: approveError,
	} = useWriteContract();

	const {
		writeContract: writeSwap,
		data: swapHash,
		isPending: isSwapPending,
		error: swapError,
	} = useWriteContract();

	const {
		isLoading: isApproveConfirming,
		error: approveReceiptError,
	} = useWaitForTransactionReceipt({
		hash: approveHash,
	});

	const {
		isLoading: isSwapConfirming,
		error: swapReceiptError,
	} = useWaitForTransactionReceipt({
		hash: swapHash,
	});

	useEffect(() => {
		let cancelled = false;

		async function estimate() {
			if (
				!publicClient ||
				!address ||
				parsedAmountIn === undefined ||
				parsedMinAmountOut === undefined ||
				expectedAmountOut === undefined ||
				expectedAmountOut === 0n
			) {
				setEstimatedGas(undefined);
				return;
			}

			try {
				const gas = await publicClient.estimateContractGas({
					account: address,
					address: contracts.pool,
					abi: liquidityPoolAbi,
					functionName: 'swap',
					args: [tokenInAddress, parsedAmountIn, parsedMinAmountOut],
				});

				if (!cancelled) {
					setEstimatedGas(gas);
				}
			} catch {
				if (!cancelled) {
					setEstimatedGas(undefined);
				}
			}
		}

		void estimate();

		return () => {
			cancelled = true;
		};
	}, [
		address,
		expectedAmountOut,
		parsedAmountIn,
		parsedMinAmountOut,
		publicClient,
		tokenInAddress,
	]);

	const allowance = allowanceQuery.data;
	const balance = balanceQuery.data;

	const needsApproval =
		parsedAmountIn !== undefined &&
		allowance !== undefined &&
		allowance < parsedAmountIn;

	const canSwap =
		parsedAmountIn !== undefined &&
		parsedMinAmountOut !== undefined &&
		expectedAmountOut !== undefined &&
		expectedAmountOut > 0n &&
		!needsApproval;

	const poolPriceDisplay = useMemo(() => {
		if (
			reserveIn === undefined ||
			reserveOut === undefined ||
			reserveIn === 0n
		) {
			return undefined;
		}

		const price =
			Number(formatUnits(reserveOut, outputDecimals)) /
			Number(formatUnits(reserveIn, inputDecimals));

		return `1 ${tokenInLabel} ≈ ${price.toFixed(4)} ${tokenOutLabel}`;
	}, [inputDecimals, outputDecimals, reserveIn, reserveOut, tokenInLabel, tokenOutLabel]);

	const errorMessage =
		swapReceiptError?.message ||
		swapError?.message ||
		approveReceiptError?.message ||
		approveError?.message;

	function approve() {
		if (!parsedAmountIn) return;

		writeApprove({
			address: tokenInAddress,
			abi: erc20Abi,
			functionName: 'approve',
			args: [contracts.pool, parsedAmountIn],
		});
	}

	function swap() {
		if (!parsedAmountIn || !parsedMinAmountOut) return;

		writeSwap({
			address: contracts.pool,
			abi: liquidityPoolAbi,
			functionName: 'swap',
			args: [tokenInAddress, parsedAmountIn, parsedMinAmountOut],
		});
	}

	return {
		tokenInLabel,
		tokenOutLabel,
		isAmountInValid: parsedAmountIn !== undefined,
		isSlippageValid: slippageBps !== undefined,
		inputBalanceFormatted:
			balance !== undefined ? formatUnits(balance, inputDecimals) : undefined,
		allowanceFormatted:
			allowance !== undefined ? formatUnits(allowance, inputDecimals) : undefined,
		expectedAmountOutFormatted:
			expectedAmountOut !== undefined
				? formatUnits(expectedAmountOut, outputDecimals)
				: undefined,
		minAmountOutFormatted:
			parsedMinAmountOut !== undefined
				? formatUnits(parsedMinAmountOut, outputDecimals)
				: undefined,
		poolPriceDisplay,
		estimatedGasFormatted: estimatedGas?.toString(),
		poolAddress: contracts.pool,
		isHighSlippage,
		needsApproval,
		canSwap,
		errorMessage,
		approve,
		swap,
		isApprovePending,
		isApproveConfirming,
		isSwapPending,
		isSwapConfirming,
	};
}
