import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useWallet', () => ({
	useWallet: vi.fn(),
}));

vi.mock('./hooks/useContractsData', () => ({
	useContractsData: vi.fn(),
}));

vi.mock('./hooks/useBackendOverview', () => ({
	useBackendOverview: vi.fn(),
}));

vi.mock('./hooks/useStaking', () => ({
	useStaking: vi.fn(),
}));

vi.mock('./hooks/useLiquidity', () => ({
	useLiquidity: vi.fn(),
}));

vi.mock('./hooks/useSwap', () => ({
	useSwap: vi.fn(),
}));

vi.mock('./hooks/useTransactionFeed', () => ({
	useTransactionFeed: vi.fn(),
}));

vi.mock('./hooks/useRemoveLiquidity', () => ({
	useRemoveLiquidity: vi.fn(),
}));

vi.mock('./hooks/useYieldFarming', () => ({
	useYieldFarming: vi.fn(),
}));

import { useBackendOverview } from './hooks/useBackendOverview';
import { useContractsData } from './hooks/useContractsData';
import { useLiquidity } from './hooks/useLiquidity';
import { useRemoveLiquidity } from './hooks/useRemoveLiquidity';
import { useStaking } from './hooks/useStaking';
import { useSwap } from './hooks/useSwap';
import { useTransactionFeed } from './hooks/useTransactionFeed';
import { useWallet } from './hooks/useWallet';
import { useYieldFarming } from './hooks/useYieldFarming';

const mockedUseWallet = vi.mocked(useWallet);
const mockedUseContractsData = vi.mocked(useContractsData);
const mockedUseBackendOverview = vi.mocked(useBackendOverview);
const mockedUseStaking = vi.mocked(useStaking);
const mockedUseLiquidity = vi.mocked(useLiquidity);
const mockedUseSwap = vi.mocked(useSwap);
const mockedUseTransactionFeed = vi.mocked(useTransactionFeed);
const mockedUseRemoveLiquidity = vi.mocked(useRemoveLiquidity);
const mockedUseYieldFarming = vi.mocked(useYieldFarming);

function mockCommonHooks() {
	mockedUseContractsData.mockReturnValue({
		tokenName: 'Token A',
		tokenSymbol: 'TKA',
		totalSupply: 1_000_000n,
		reserveA: 1_000n,
		reserveB: 1_000n,
	});

	mockedUseBackendOverview.mockReturnValue({
		data: {
			pool: { approxTvlFormatted: '2000.00' },
			staking: { approxAprPercent: '3153.60' },
			farming: { approxAprPercent: '3153.60' },
		},
		error: null,
	} as ReturnType<typeof useBackendOverview>);

	mockedUseStaking.mockReturnValue({
		isStakeAmountValid: true,
		isUnstakeAmountValid: true,
		tokenBalanceFormatted: '100',
		allowanceFormatted: '10',
		stakedBalanceFormatted: '5',
		pendingRewardsFormatted: '1',
		errorMessage: undefined,
		needsApproval: false,
		canUnstake: true,
		canClaim: true,
		approve: vi.fn(),
		stake: vi.fn(),
		unstake: vi.fn(),
		claimRewards: vi.fn(),
		isApprovePending: false,
		isApproveConfirming: false,
		isStakePending: false,
		isStakeConfirming: false,
		isUnstakePending: false,
		isUnstakeConfirming: false,
		isClaimPending: false,
		isClaimConfirming: false,
	});

	mockedUseLiquidity.mockReturnValue({
		isAmountAValid: true,
		isAmountBValid: true,
		tokenABalanceFormatted: '100',
		tokenBBalanceFormatted: '100',
		allowanceAFormatted: '0',
		allowanceBFormatted: '0',
		lpBalanceFormatted: '2',
		estimatedLpMintedFormatted: '1',
		projectedSharePercent: '50.00%',
		poolRatioDisplay: '1 Token A ≈ 1.0000 Token B',
		errorMessage: undefined,
		needsApprovalA: true,
		needsApprovalB: true,
		canAddLiquidity: false,
		approveA: vi.fn(),
		approveB: vi.fn(),
		addLiquidity: vi.fn(),
		isApproveAPending: false,
		isApproveAConfirming: false,
		isApproveBPending: false,
		isApproveBConfirming: false,
		isAddLiquidityPending: false,
		isAddLiquidityConfirming: false,
	});

	mockedUseSwap.mockReturnValue({
		tokenInLabel: 'Token A',
		tokenOutLabel: 'Token B',
		isAmountInValid: true,
		isSlippageValid: true,
		inputBalanceFormatted: '100',
		allowanceFormatted: '0',
		expectedAmountOutFormatted: '9.09',
		minAmountOutFormatted: '9.04',
		poolPriceDisplay: '1 Token A ≈ 1.0000 Token B',
		estimatedGasFormatted: '153421',
		poolAddress: '0xpool',
		isHighSlippage: false,
		needsApproval: true,
		canSwap: false,
		errorMessage: undefined,
		approve: vi.fn(),
		swap: vi.fn(),
		isApprovePending: false,
		isApproveConfirming: false,
		isSwapPending: false,
		isSwapConfirming: false,
	});

	mockedUseRemoveLiquidity.mockReturnValue({
		isAmountValid: true,
		lpBalanceFormatted: '10',
		errorMessage: undefined,
		canRemove: true,
		removeLiquidity: vi.fn(),
		isRemoveLiquidityPending: false,
		isRemoveLiquidityConfirming: false,
	});

	mockedUseYieldFarming.mockReturnValue({
		isStakeAmountValid: true,
		isUnstakeAmountValid: true,
		lpBalanceFormatted: '10',
		allowanceFormatted: '2',
		stakedBalanceFormatted: '1',
		pendingRewardsFormatted: '0.5',
		errorMessage: undefined,
		needsApproval: false,
		canUnstake: true,
		canClaim: true,
		approve: vi.fn(),
		stake: vi.fn(),
		unstake: vi.fn(),
		claimRewards: vi.fn(),
		isApprovePending: false,
		isApproveConfirming: false,
		isStakePending: false,
		isStakeConfirming: false,
		isUnstakePending: false,
		isUnstakeConfirming: false,
		isClaimPending: false,
		isClaimConfirming: false,
	});

	mockedUseTransactionFeed.mockReturnValue([]);
}

describe('App shell states', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCommonHooks();
	});

	it('renders wallet connect state when disconnected', () => {
		mockedUseWallet.mockReturnValue({
			address: undefined,
			nativeBalance: undefined,
			nativeBalanceSymbol: undefined,
			chainId: 31337,
			expectedChainId: 31337,
			isCorrectChain: false,
			isConnected: false,
			connect: vi.fn(),
			connectors: [
				{
					uid: '1',
					id: 'metaMask',
					name: 'MetaMask',
					type: 'injected',
					connect: vi.fn(),
					disconnect: vi.fn(),
				},
			] as never[],
			isPending: false,
			disconnect: vi.fn(),
			switchChain: vi.fn(),
		});

		render(<App />);

		expect(screen.getByText('Connect wallet')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /connect metamask/i })).toBeInTheDocument();
	});

	it('renders wrong network state when chain is incorrect', () => {
		mockedUseWallet.mockReturnValue({
			address: '0x123',
			nativeBalance: '10000',
			nativeBalanceSymbol: 'ETH',
			chainId: 1,
			expectedChainId: 31337,
			isCorrectChain: false,
			isConnected: true,
			connect: vi.fn(),
			connectors: [],
			isPending: false,
			disconnect: vi.fn(),
			switchChain: vi.fn(),
		});

		render(<App />);

		expect(screen.getByText('Switch network')).toBeInTheDocument();
		expect(screen.getByText(/expected chain: 31337/i)).toBeInTheDocument();
	});

	it('renders dashboard modules when connected to the correct network', () => {
		mockedUseWallet.mockReturnValue({
			address: '0x123',
			nativeBalance: '10000',
			nativeBalanceSymbol: 'ETH',
			chainId: 31337,
			expectedChainId: 31337,
			isCorrectChain: true,
			isConnected: true,
			connect: vi.fn(),
			connectors: [],
			isPending: false,
			disconnect: vi.fn(),
			switchChain: vi.fn(),
		});

		render(<App />);

		expect(screen.getByText('Wallet Status')).toBeInTheDocument();
		expect(screen.getByText('Market Snapshot')).toBeInTheDocument();
		expect(screen.getByText('Analytics Snapshot')).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Trade' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Liquidity' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Rewards' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Swap' })).toBeInTheDocument();

		fireEvent.click(screen.getByRole('tab', { name: 'Liquidity' }));
		expect(screen.getByRole('heading', { name: 'Add Liquidity' })).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: 'Remove Liquidity' }),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole('tab', { name: 'Rewards' }));
		expect(screen.getByRole('heading', { name: 'Staking' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Yield Farming' })).toBeInTheDocument();
	});
});
