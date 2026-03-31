import { useState } from 'react';
import './App.css';
import { AddLiquiditySection } from './components/AddLiquiditySection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { ContractDataSection } from './components/ContractDataSection';
import { RemoveLiquiditySection } from './components/RemoveLiquiditySection';
import { StakingSection } from './components/StakingSection';
import { SwapSection } from './components/SwapSection';
import { TransactionFeed } from './components/TransactionFeed';
import { WalletStatusSection } from './components/WalletStatusSection';
import { YieldFarmingSection } from './components/YieldFarmingSection';
import { TokenBadge } from './components/TokenBadge';
import { useContractsData } from './hooks/useContractsData';
import { useBackendOverview } from './hooks/useBackendOverview';
import { useLiquidity } from './hooks/useLiquidity';
import { useRemoveLiquidity } from './hooks/useRemoveLiquidity';
import { useStaking } from './hooks/useStaking';
import { useSwap } from './hooks/useSwap';
import { useTransactionFeed } from './hooks/useTransactionFeed';
import { useWallet } from './hooks/useWallet';
import { useYieldFarming } from './hooks/useYieldFarming';

type WorkspaceTab = 'trade' | 'liquidity' | 'rewards';

const workspaceGuidance: Record<WorkspaceTab, string[]> = {
	trade: [
		'Review expected output before signing.',
		'Keep slippage tight unless the pool is moving fast.',
		'Approval and swap remain separate actions.',
	],
	liquidity: [
		'Match the pool ratio before adding depth.',
		'Check projected LP and pool share before depositing.',
		'Use remove liquidity to unwind proportionally.',
	],
	rewards: [
		'Stake and farming positions stay isolated.',
		'Claims are independent from principal exit.',
		'LP farming uses LP as input and RWD as reward.',
	],
};

const workspaceTabs: Array<{
	id: WorkspaceTab;
	label: string;
	description: string;
	kind: 'swap' | 'lp' | 'reward';
}> = [
	{
		id: 'trade',
		label: 'Trade',
		description: 'Swap between the live pool assets with slippage protection.',
		kind: 'swap',
	},
	{
		id: 'liquidity',
		label: 'Liquidity',
		description: 'Add or remove pool depth and manage LP exposure.',
		kind: 'lp',
	},
	{
		id: 'rewards',
		label: 'Rewards',
		description: 'Manage base-token staking and LP farming positions.',
		kind: 'reward',
	},
];

function App() {
	const {
		address,
		nativeBalance,
		nativeBalanceSymbol,
		chainId,
		expectedChainId,
		isCorrectChain,
		isConnected,
		connect,
		connectors,
		isPending,
		disconnect,
		switchChain,
	} = useWallet();

	const { tokenName, tokenSymbol, totalSupply, reserveA, reserveB } =
		useContractsData();

	const [stakeAmount, setStakeAmount] = useState('');
	const [unstakeAmount, setUnstakeAmount] = useState('');
	const [liquidityAmountA, setLiquidityAmountA] = useState('');
	const [liquidityAmountB, setLiquidityAmountB] = useState('');
	const [swapDirection, setSwapDirection] = useState<'A_TO_B' | 'B_TO_A'>(
		'A_TO_B',
	);
	const [swapAmountIn, setSwapAmountIn] = useState('');
	const [swapSlippagePercent, setSwapSlippagePercent] = useState('0.5');
	const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('');
	const [farmStakeAmount, setFarmStakeAmount] = useState('');
	const [farmUnstakeAmount, setFarmUnstakeAmount] = useState('');
	const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('trade');

	const backendOverviewQuery = useBackendOverview();

	const {
		isStakeAmountValid,
		isUnstakeAmountValid,
		tokenBalanceFormatted,
		allowanceFormatted,
		stakedBalanceFormatted,
		pendingRewardsFormatted,
		errorMessage: stakingErrorMessage,
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
	} = useStaking(stakeAmount, unstakeAmount);

	const {
		isAmountAValid,
		isAmountBValid,
		tokenABalanceFormatted,
		tokenBBalanceFormatted,
		allowanceAFormatted,
		allowanceBFormatted,
		lpBalanceFormatted: liquidityLpBalanceFormatted,
		estimatedLpMintedFormatted,
		projectedSharePercent,
		poolRatioDisplay,
		errorMessage: liquidityErrorMessage,
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
	} = useLiquidity(liquidityAmountA, liquidityAmountB);

	const {
		tokenInLabel,
		tokenOutLabel,
		isAmountInValid,
		isSlippageValid,
		inputBalanceFormatted,
		allowanceFormatted: swapAllowanceFormatted,
		expectedAmountOutFormatted,
		minAmountOutFormatted,
		poolPriceDisplay,
		estimatedGasFormatted,
		poolAddress,
		isHighSlippage,
		needsApproval: swapNeedsApproval,
		canSwap,
		errorMessage: swapErrorMessage,
		approve: approveSwapToken,
		swap,
		isApprovePending: isSwapApprovePending,
		isApproveConfirming: isSwapApproveConfirming,
		isSwapPending,
		isSwapConfirming,
	} = useSwap(swapDirection, swapAmountIn, swapSlippagePercent);

	const {
		isAmountValid: isRemoveLiquidityAmountValid,
		lpBalanceFormatted,
		errorMessage: removeLiquidityErrorMessage,
		canRemove,
		removeLiquidity,
		isRemoveLiquidityPending,
		isRemoveLiquidityConfirming,
	} = useRemoveLiquidity(removeLiquidityAmount);

	const {
		isStakeAmountValid: isFarmStakeAmountValid,
		isUnstakeAmountValid: isFarmUnstakeAmountValid,
		lpBalanceFormatted: farmLpBalanceFormatted,
		allowanceFormatted: farmAllowanceFormatted,
		stakedBalanceFormatted: farmStakedBalanceFormatted,
		pendingRewardsFormatted: farmPendingRewardsFormatted,
		errorMessage: yieldFarmingErrorMessage,
		needsApproval: farmingNeedsApproval,
		canUnstake: canFarmUnstake,
		canClaim: canFarmClaim,
		approve: approveFarming,
		stake: stakeFarming,
		unstake: unstakeFarming,
		claimRewards: claimFarmingRewards,
		isApprovePending: isFarmApprovePending,
		isApproveConfirming: isFarmApproveConfirming,
		isStakePending: isFarmStakePending,
		isStakeConfirming: isFarmStakeConfirming,
		isUnstakePending: isFarmUnstakePending,
		isUnstakeConfirming: isFarmUnstakeConfirming,
		isClaimPending: isFarmClaimPending,
		isClaimConfirming: isFarmClaimConfirming,
	} = useYieldFarming(farmStakeAmount, farmUnstakeAmount);

	const activeWorkspaceMeta =
		workspaceTabs.find((tab) => tab.id === activeWorkspace) ?? workspaceTabs[0];
	const shortAddress = address
		? `${address.slice(0, 6)}...${address.slice(-4)}`
		: 'Awaiting wallet';
	const formattedNativeBalance = nativeBalance
		? new Intl.NumberFormat('en-US', {
				maximumFractionDigits: 4,
			}).format(Number(nativeBalance))
		: 'Loading...';
	const formattedApproxTvl = backendOverviewQuery.data?.pool.approxTvlFormatted
		? new Intl.NumberFormat('en-US', {
				maximumFractionDigits: 2,
			}).format(Number(backendOverviewQuery.data.pool.approxTvlFormatted))
		: 'Loading...';

	const transactionFeedItems = useTransactionFeed([
		{
			id: 'swap',
			label: 'Swap flow',
			active:
				isSwapApprovePending ||
				isSwapApproveConfirming ||
				isSwapPending ||
				isSwapConfirming,
			error: swapErrorMessage,
		},
		{
			id: 'liquidity',
			label: 'Liquidity flow',
			active:
				isApproveAPending ||
				isApproveAConfirming ||
				isApproveBPending ||
				isApproveBConfirming ||
				isAddLiquidityPending ||
				isAddLiquidityConfirming,
			error: liquidityErrorMessage,
		},
		{
			id: 'remove-liquidity',
			label: 'Remove liquidity',
			active: isRemoveLiquidityPending || isRemoveLiquidityConfirming,
			error: removeLiquidityErrorMessage,
		},
		{
			id: 'staking',
			label: 'Staking flow',
			active:
				isApprovePending ||
				isApproveConfirming ||
				isStakePending ||
				isStakeConfirming ||
				isUnstakePending ||
				isUnstakeConfirming ||
				isClaimPending ||
				isClaimConfirming,
			error: stakingErrorMessage,
		},
		{
			id: 'farming',
			label: 'Yield farming flow',
			active:
				isFarmApprovePending ||
				isFarmApproveConfirming ||
				isFarmStakePending ||
				isFarmStakeConfirming ||
				isFarmUnstakePending ||
				isFarmUnstakeConfirming ||
				isFarmClaimPending ||
				isFarmClaimConfirming,
			error: yieldFarmingErrorMessage,
		},
	]);

	return (
		<main className="app-shell">
			<header className="app-header">
				<div className="app-header__content">
					<div className="app-header__copy">
						<p className="app-eyebrow">Ethereum DeFi control surface</p>
						<h1>DeFi App</h1>
						<p className="app-subtitle">
							Operate the full local protocol stack from one surface: trade the
							pair, manage LP, and run staking or farming positions without
							leaving the app.
						</p>
					</div>

					<div className="hero-surface">
						<div className="hero-surface__main">
							<div className="hero-surface__bar">
								<div className="hero-surface__status">
									<span className="hero-surface__pulse" aria-hidden="true" />
									<p>
										{isConnected && isCorrectChain
											? 'Connected to the active deployment'
											: 'Wallet or network still needs attention'}
									</p>
								</div>

								<div className="hero-surface__context">
									<TokenBadge label={`${tokenSymbol ?? 'TKA'} / TKB`} kind="swap" />
									<TokenBadge
										label={activeWorkspaceMeta.label}
										kind={activeWorkspaceMeta.kind}
									/>
								</div>
							</div>

							<div className="module-strip" aria-label="Protocol modules">
								<TokenBadge label="Wallet" kind="wallet" />
								<TokenBadge label="DEX" kind="swap" />
								<TokenBadge label="Stake Core" kind="staking" />
								<TokenBadge label="LP Farming" kind="lp" />
								<TokenBadge label="Analytics" kind="analytics" />
							</div>

							<div className="hero-inline-stats">
								<div className="hero-inline-stat">
									<span>Approx. TVL</span>
									<strong>{formattedApproxTvl}</strong>
								</div>
								<div className="hero-inline-stat">
									<span>Session wallet</span>
									<strong>{shortAddress}</strong>
								</div>
								<div className="hero-inline-stat">
									<span>Native gas</span>
									<strong>
										{formattedNativeBalance} {nativeBalanceSymbol ?? ''}
									</strong>
								</div>
								<div className="hero-inline-stat">
									<span>Chain</span>
									<strong>{chainId ?? expectedChainId}</strong>
								</div>
							</div>
						</div>

						<aside className="hero-surface__side">
							<p className="hero-side__eyebrow">Current focus</p>
							<h2>{activeWorkspaceMeta.label}</h2>
							<p className="hero-side__summary">{activeWorkspaceMeta.description}</p>
							<ul className="hero-side__list">
								{workspaceGuidance[activeWorkspace].map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<p className="hero-side__footer">
								Token set: {tokenName ?? 'Token A'} / TKB / RWD
							</p>
						</aside>
					</div>
				</div>
			</header>

			<TransactionFeed items={transactionFeedItems} />

			{!isConnected ? (
				<section className="status-panel">
					<h2>Connect wallet</h2>
					<p className="support-copy">
						Start by connecting your injected wallet to access the full protocol
						surface.
					</p>
					<div className="connect-list">
						{connectors.map((connector) => (
							<button
								key={connector.uid}
								onClick={() => connect({ connector })}
								disabled={isPending}
							>
								Connect {connector.name}
							</button>
						))}
					</div>
				</section>
			) : !isCorrectChain ? (
				<section className="wrong-chain-panel">
					<h2>Switch network</h2>
					<p className="support-copy">
						The wallet is connected, but the app is pointed at a different
						network than the local deployment.
					</p>
					<p>Connected: {address}</p>
					<p>Current chain: {chainId}</p>
					<p>Expected chain: {expectedChainId}</p>
					<div className="button-row">
						<button onClick={() => switchChain({ chainId: expectedChainId })}>
							Switch Network
						</button>
						<button className="secondary-button" onClick={() => disconnect()}>
							Disconnect
						</button>
					</div>
				</section>
			) : (
				<div className="dashboard">
					<div className="overview-grid">
						<WalletStatusSection
							address={address}
							nativeBalance={nativeBalance}
							nativeBalanceSymbol={nativeBalanceSymbol}
							chainId={chainId}
							onDisconnect={disconnect}
						/>

						<ContractDataSection
							tokenName={tokenName}
							tokenSymbol={tokenSymbol}
							totalSupply={totalSupply}
							reserveA={reserveA}
							reserveB={reserveB}
						/>

						<AnalyticsSection
							approxTvlFormatted={backendOverviewQuery.data?.pool.approxTvlFormatted}
							stakingAprPercent={backendOverviewQuery.data?.staking.approxAprPercent}
							farmingAprPercent={backendOverviewQuery.data?.farming.approxAprPercent}
							errorMessage={
								backendOverviewQuery.error instanceof Error
									? backendOverviewQuery.error.message
									: undefined
							}
						/>
					</div>

					<section className="module-stage">
						<div className="module-stage__header">
							<div>
								<p className="section-kicker">Action modules</p>
								<h2>Protocol Workspace</h2>
								<p className="support-copy">
									Switch between execution surfaces instead of stacking every form in a
									single long page.
								</p>
							</div>
							<p className="module-stage__summary">
								{
									workspaceTabs.find((tab) => tab.id === activeWorkspace)
										?.description
								}
							</p>
						</div>

						<div className="module-stage__tabs" role="tablist" aria-label="Protocol modules">
							{workspaceTabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									role="tab"
									aria-selected={activeWorkspace === tab.id}
									className={`module-tab${
										activeWorkspace === tab.id ? ' module-tab--active' : ''
									}`}
									onClick={() => setActiveWorkspace(tab.id)}
								>
									<span
										className={`module-tab__icon module-tab__icon--${tab.kind}`}
										aria-hidden="true"
									/>
									<span className="module-tab__label">{tab.label}</span>
								</button>
							))}
						</div>

						<div key={activeWorkspace} className="module-stage__panel" role="tabpanel">
							{activeWorkspace === 'trade' ? (
								<div className="module-grid module-grid--single">
									<SwapSection
										tokenInLabel={tokenInLabel}
										tokenOutLabel={tokenOutLabel}
										inputBalanceFormatted={inputBalanceFormatted}
										swapAllowanceFormatted={swapAllowanceFormatted}
										swapDirection={swapDirection}
										onSwapDirectionChange={setSwapDirection}
										swapAmountIn={swapAmountIn}
										onSwapAmountInChange={setSwapAmountIn}
										isAmountInValid={isAmountInValid}
										swapSlippagePercent={swapSlippagePercent}
										onSwapSlippagePercentChange={setSwapSlippagePercent}
										isSlippageValid={isSlippageValid}
										expectedAmountOutFormatted={expectedAmountOutFormatted}
										minAmountOutFormatted={minAmountOutFormatted}
										poolPriceDisplay={poolPriceDisplay}
										estimatedGasFormatted={estimatedGasFormatted}
										poolAddress={poolAddress}
										isHighSlippage={isHighSlippage}
										swapNeedsApproval={swapNeedsApproval}
										canSwap={canSwap}
										errorMessage={swapErrorMessage}
										onApproveSwapToken={approveSwapToken}
										onSwap={swap}
										isSwapApprovePending={isSwapApprovePending}
										isSwapApproveConfirming={isSwapApproveConfirming}
										isSwapPending={isSwapPending}
										isSwapConfirming={isSwapConfirming}
									/>
								</div>
							) : null}

							{activeWorkspace === 'liquidity' ? (
								<div className="module-grid module-grid--split">
									<AddLiquiditySection
										tokenABalanceFormatted={tokenABalanceFormatted}
										tokenBBalanceFormatted={tokenBBalanceFormatted}
										allowanceAFormatted={allowanceAFormatted}
										allowanceBFormatted={allowanceBFormatted}
										lpBalanceFormatted={liquidityLpBalanceFormatted}
										estimatedLpMintedFormatted={estimatedLpMintedFormatted}
										projectedSharePercent={projectedSharePercent}
										poolRatioDisplay={poolRatioDisplay}
										errorMessage={liquidityErrorMessage}
										liquidityAmountA={liquidityAmountA}
										onLiquidityAmountAChange={setLiquidityAmountA}
										isAmountAValid={isAmountAValid}
										liquidityAmountB={liquidityAmountB}
										onLiquidityAmountBChange={setLiquidityAmountB}
										isAmountBValid={isAmountBValid}
										needsApprovalA={needsApprovalA}
										needsApprovalB={needsApprovalB}
										canAddLiquidity={canAddLiquidity}
										onApproveA={approveA}
										onApproveB={approveB}
										onAddLiquidity={addLiquidity}
										isApproveAPending={isApproveAPending}
										isApproveAConfirming={isApproveAConfirming}
										isApproveBPending={isApproveBPending}
										isApproveBConfirming={isApproveBConfirming}
										isAddLiquidityPending={isAddLiquidityPending}
										isAddLiquidityConfirming={isAddLiquidityConfirming}
									/>

									<RemoveLiquiditySection
										lpBalanceFormatted={lpBalanceFormatted}
										removeLiquidityAmount={removeLiquidityAmount}
										onRemoveLiquidityAmountChange={setRemoveLiquidityAmount}
										isRemoveLiquidityAmountValid={isRemoveLiquidityAmountValid}
										errorMessage={removeLiquidityErrorMessage}
										canRemove={canRemove}
										onRemoveLiquidity={removeLiquidity}
										isRemoveLiquidityPending={isRemoveLiquidityPending}
										isRemoveLiquidityConfirming={isRemoveLiquidityConfirming}
									/>
								</div>
							) : null}

							{activeWorkspace === 'rewards' ? (
								<div className="module-grid module-grid--split">
									<StakingSection
										tokenBalanceFormatted={tokenBalanceFormatted}
										allowanceFormatted={allowanceFormatted}
										stakedBalanceFormatted={stakedBalanceFormatted}
										pendingRewardsFormatted={pendingRewardsFormatted}
										errorMessage={stakingErrorMessage}
										stakeAmount={stakeAmount}
										onStakeAmountChange={setStakeAmount}
										isStakeAmountValid={isStakeAmountValid}
										needsApproval={needsApproval}
										onApprove={approve}
										onStake={stake}
										isApprovePending={isApprovePending}
										isApproveConfirming={isApproveConfirming}
										isStakePending={isStakePending}
										isStakeConfirming={isStakeConfirming}
										unstakeAmount={unstakeAmount}
										onUnstakeAmountChange={setUnstakeAmount}
										isUnstakeAmountValid={isUnstakeAmountValid}
										canUnstake={canUnstake}
										onUnstake={unstake}
										isUnstakePending={isUnstakePending}
										isUnstakeConfirming={isUnstakeConfirming}
										canClaim={canClaim}
										onClaimRewards={claimRewards}
										isClaimPending={isClaimPending}
										isClaimConfirming={isClaimConfirming}
									/>

									<YieldFarmingSection
										farmLpBalanceFormatted={farmLpBalanceFormatted}
										farmAllowanceFormatted={farmAllowanceFormatted}
										farmStakedBalanceFormatted={farmStakedBalanceFormatted}
										farmPendingRewardsFormatted={farmPendingRewardsFormatted}
										errorMessage={yieldFarmingErrorMessage}
										farmStakeAmount={farmStakeAmount}
										onFarmStakeAmountChange={setFarmStakeAmount}
										isFarmStakeAmountValid={isFarmStakeAmountValid}
										farmingNeedsApproval={farmingNeedsApproval}
										onApproveFarming={approveFarming}
										onStakeFarming={stakeFarming}
										isFarmApprovePending={isFarmApprovePending}
										isFarmApproveConfirming={isFarmApproveConfirming}
										isFarmStakePending={isFarmStakePending}
										isFarmStakeConfirming={isFarmStakeConfirming}
										farmUnstakeAmount={farmUnstakeAmount}
										onFarmUnstakeAmountChange={setFarmUnstakeAmount}
										isFarmUnstakeAmountValid={isFarmUnstakeAmountValid}
										canFarmUnstake={canFarmUnstake}
										onUnstakeFarming={unstakeFarming}
										isFarmUnstakePending={isFarmUnstakePending}
										isFarmUnstakeConfirming={isFarmUnstakeConfirming}
										canFarmClaim={canFarmClaim}
										onClaimFarmingRewards={claimFarmingRewards}
										isFarmClaimPending={isFarmClaimPending}
										isFarmClaimConfirming={isFarmClaimConfirming}
									/>
								</div>
							) : null}
						</div>
					</section>
				</div>
			)}
		</main>
	);
}

export default App;
