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
import { yieldFarmingAbi } from '../lib/yieldFarmingAbi';

export function useYieldFarming(stakeAmount: string, unstakeAmount: string) {
	const { address } = useAccount();

	const lpTokenAddressQuery = useReadContract({
		address: contracts.farming,
		abi: yieldFarmingAbi,
		functionName: 'lpToken',
	});

	const rewardTokenAddressQuery = useReadContract({
		address: contracts.farming,
		abi: yieldFarmingAbi,
		functionName: 'rewardToken',
	});

	const lpTokenAddress = lpTokenAddressQuery.data as Address | undefined;
	const rewardTokenAddress = rewardTokenAddressQuery.data as
		| Address
		| undefined;

	const lpDecimalsQuery = useReadContract({
		address: lpTokenAddress,
		abi: erc20Abi,
		functionName: 'decimals',
		query: {
			enabled: Boolean(lpTokenAddress),
		},
	});

	const rewardDecimalsQuery = useReadContract({
		address: rewardTokenAddress,
		abi: erc20Abi,
		functionName: 'decimals',
		query: {
			enabled: Boolean(rewardTokenAddress),
		},
	});

	const lpDecimals = lpDecimalsQuery.data ?? 18;
	const rewardDecimals = rewardDecimalsQuery.data ?? 18;

	const parsedStakeAmount = useMemo(() => {
		if (!stakeAmount.trim()) return undefined;

		try {
			return parseUnits(stakeAmount, lpDecimals);
		} catch {
			return undefined;
		}
	}, [stakeAmount, lpDecimals]);

	const parsedUnstakeAmount = useMemo(() => {
		if (!unstakeAmount.trim()) return undefined;

		try {
			return parseUnits(unstakeAmount, lpDecimals);
		} catch {
			return undefined;
		}
	}, [unstakeAmount, lpDecimals]);

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

	const allowanceQuery = useReadContract({
		address: lpTokenAddress,
		abi: erc20Abi,
		functionName: 'allowance',
		args: address ? [address, contracts.farming] : undefined,
		query: {
			enabled: Boolean(address && lpTokenAddress),
			refetchInterval: 2000,
		},
	});

	const stakedBalanceQuery = useReadContract({
		address: contracts.farming,
		abi: yieldFarmingAbi,
		functionName: 'stakedBalance',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(address),
			refetchInterval: 2000,
		},
	});

	const pendingRewardsQuery = useReadContract({
		address: contracts.farming,
		abi: yieldFarmingAbi,
		functionName: 'pendingRewards',
		args: address ? [address] : undefined,
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
		writeContract: writeStake,
		data: stakeHash,
		isPending: isStakePending,
		error: stakeError,
	} = useWriteContract();

	const {
		writeContract: writeUnstake,
		data: unstakeHash,
		isPending: isUnstakePending,
		error: unstakeError,
	} = useWriteContract();

	const {
		writeContract: writeClaim,
		data: claimHash,
		isPending: isClaimPending,
		error: claimError,
	} = useWriteContract();

	const { isLoading: isApproveConfirming, error: approveReceiptError } = useWaitForTransactionReceipt({
		hash: approveHash,
	});

	const { isLoading: isStakeConfirming, error: stakeReceiptError } = useWaitForTransactionReceipt({
		hash: stakeHash,
	});

	const { isLoading: isUnstakeConfirming, error: unstakeReceiptError } = useWaitForTransactionReceipt({
		hash: unstakeHash,
	});

	const { isLoading: isClaimConfirming, error: claimReceiptError } = useWaitForTransactionReceipt({
		hash: claimHash,
	});

	const lpBalance = lpBalanceQuery.data;
	const allowance = allowanceQuery.data;
	const stakedBalance = stakedBalanceQuery.data;
	const pendingRewards = pendingRewardsQuery.data;

	const needsApproval =
		parsedStakeAmount !== undefined &&
		allowance !== undefined &&
		allowance < parsedStakeAmount;

	const canUnstake =
		parsedUnstakeAmount !== undefined &&
		stakedBalance !== undefined &&
		parsedUnstakeAmount <= stakedBalance;

	const canClaim = pendingRewards !== undefined && pendingRewards > 0n;
	const errorMessage =
		claimReceiptError?.message ||
		claimError?.message ||
		unstakeReceiptError?.message ||
		unstakeError?.message ||
		stakeReceiptError?.message ||
		stakeError?.message ||
		approveReceiptError?.message ||
		approveError?.message;

	function approve() {
		if (!parsedStakeAmount || !lpTokenAddress) return;

		writeApprove({
			address: lpTokenAddress,
			abi: erc20Abi,
			functionName: 'approve',
			args: [contracts.farming, parsedStakeAmount],
		});
	}

	function stake() {
		if (!parsedStakeAmount) return;

		writeStake({
			address: contracts.farming,
			abi: yieldFarmingAbi,
			functionName: 'stake',
			args: [parsedStakeAmount],
		});
	}

	function unstake() {
		if (!parsedUnstakeAmount) return;

		writeUnstake({
			address: contracts.farming,
			abi: yieldFarmingAbi,
			functionName: 'unstake',
			args: [parsedUnstakeAmount],
		});
	}

	function claimRewards() {
		writeClaim({
			address: contracts.farming,
			abi: yieldFarmingAbi,
			functionName: 'claimRewards',
		});
	}

	return {
		isStakeAmountValid: parsedStakeAmount !== undefined,
		isUnstakeAmountValid: parsedUnstakeAmount !== undefined,
		lpBalanceFormatted:
			lpBalance !== undefined ? formatUnits(lpBalance, lpDecimals) : undefined,
		allowanceFormatted:
			allowance !== undefined ? formatUnits(allowance, lpDecimals) : undefined,
		stakedBalanceFormatted:
			stakedBalance !== undefined
				? formatUnits(stakedBalance, lpDecimals)
				: undefined,
		pendingRewardsFormatted:
			pendingRewards !== undefined
				? formatUnits(pendingRewards, rewardDecimals)
				: undefined,
		errorMessage,
		needsApproval,
		canUnstake,
		canClaim,
		approve,
		stake,
		unstake,
		claimRewards,
		isApprovePending,
		isApproveConfirming,
		isStakePending,
		isStakeConfirming,
		isUnstakePending,
		isUnstakeConfirming,
		isClaimPending,
		isClaimConfirming,
	};
}
