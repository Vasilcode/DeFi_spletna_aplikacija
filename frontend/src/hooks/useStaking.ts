import { useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';
import {
    useAccount,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from 'wagmi';
import { contracts } from '../lib/contracts';
import { erc20Abi } from '../lib/erc20Abi';
import { stakingAbi } from '../lib/stakingAbi';

export function useStaking(amount: string) {
	const { address } = useAccount();

	const decimalsQuery = useReadContract({
		address: contracts.token,
		abi: erc20Abi,
		functionName: 'decimals',
	});

	const decimals = decimalsQuery.data ?? 18;

	const parsedAmount = useMemo(() => {
		if (!amount.trim()) return undefined;

		try {
			return parseUnits(amount, decimals);
		} catch {
			return undefined;
		}
	}, [amount, decimals]);

	const tokenBalanceQuery = useReadContract({
		address: contracts.token,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(address),
			refetchInterval: 2000,
		},
	});

	const allowanceQuery = useReadContract({
		address: contracts.token,
		abi: erc20Abi,
		functionName: 'allowance',
		args: address ? [address, contracts.staking] : undefined,
		query: {
			enabled: Boolean(address),
			refetchInterval: 2000,
		},
	});

	const stakedBalanceQuery = useReadContract({
		address: contracts.staking,
		abi: stakingAbi,
		functionName: 'stakedBalance',
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
	} = useWriteContract();

	const {
		writeContract: writeStake,
		data: stakeHash,
		isPending: isStakePending,
	} = useWriteContract();

	const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
		hash: approveHash,
	});

	const { isLoading: isStakeConfirming } = useWaitForTransactionReceipt({
		hash: stakeHash,
	});

	const allowance = allowanceQuery.data;
	const tokenBalance = tokenBalanceQuery.data;
	const stakedBalance = stakedBalanceQuery.data;

	const needsApproval =
		parsedAmount !== undefined &&
		allowance !== undefined &&
		allowance < parsedAmount;

	function approve() {
		if (!parsedAmount) return;

		writeApprove({
			address: contracts.token,
			abi: erc20Abi,
			functionName: 'approve',
			args: [contracts.staking, parsedAmount],
		});
	}

	function stake() {
		if (!parsedAmount) return;

		writeStake({
			address: contracts.staking,
			abi: stakingAbi,
			functionName: 'stake',
			args: [parsedAmount],
		});
	}

	return {
		decimals,
		parsedAmount,
		isAmountValid: parsedAmount !== undefined,
		tokenBalance,
		allowance,
		stakedBalance,
		tokenBalanceFormatted:
			tokenBalance !== undefined
				? formatUnits(tokenBalance, decimals)
				: undefined,
		allowanceFormatted:
			allowance !== undefined ? formatUnits(allowance, decimals) : undefined,
		stakedBalanceFormatted:
			stakedBalance !== undefined
				? formatUnits(stakedBalance, decimals)
				: undefined,
		needsApproval,
		approve,
		stake,
		isApprovePending,
		isApproveConfirming,
		isStakePending,
		isStakeConfirming,
	};
}
