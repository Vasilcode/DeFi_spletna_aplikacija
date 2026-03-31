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

export function useRemoveLiquidity(amount: string) {
	const { address } = useAccount();

	const lpTokenAddressQuery = useReadContract({
		address: contracts.pool,
		abi: liquidityPoolAbi,
		functionName: 'lpToken',
	});

	const lpTokenAddress = lpTokenAddressQuery.data as Address | undefined;

	const lpDecimalsQuery = useReadContract({
		address: lpTokenAddress,
		abi: erc20Abi,
		functionName: 'decimals',
		query: {
			enabled: Boolean(lpTokenAddress),
		},
	});

	const lpBalanceQuery = useReadContract({
		address: lpTokenAddress,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(address && lpTokenAddress),
			refetchInterval: 2000,
		},
	});

	const lpDecimals = lpDecimalsQuery.data ?? 18;
	const lpBalance = lpBalanceQuery.data;

	const parsedAmount = useMemo(() => {
		if (!amount.trim()) return undefined;

		try {
			return parseUnits(amount, lpDecimals);
		} catch {
			return undefined;
		}
	}, [amount, lpDecimals]);

	const canRemove =
		parsedAmount !== undefined &&
		lpBalance !== undefined &&
		parsedAmount <= lpBalance;

	const {
		writeContract: writeRemoveLiquidity,
		data: removeLiquidityHash,
		isPending: isRemoveLiquidityPending,
		error: removeLiquidityError,
	} = useWriteContract();

	const { isLoading: isRemoveLiquidityConfirming, error: removeLiquidityReceiptError } =
		useWaitForTransactionReceipt({
			hash: removeLiquidityHash,
		});

	const errorMessage =
		removeLiquidityReceiptError?.message || removeLiquidityError?.message;

	function removeLiquidity() {
		if (!parsedAmount) return;

		writeRemoveLiquidity({
			address: contracts.pool,
			abi: liquidityPoolAbi,
			functionName: 'removeLiquidity',
			args: [parsedAmount],
		});
	}

	return {
		isAmountValid: parsedAmount !== undefined,
		lpBalanceFormatted:
			lpBalance !== undefined ? formatUnits(lpBalance, lpDecimals) : undefined,
		errorMessage,
		canRemove,
		removeLiquidity,
		isRemoveLiquidityPending,
		isRemoveLiquidityConfirming,
	};
}
