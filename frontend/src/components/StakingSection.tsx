import { AmountField } from './AmountField';
import { SectionHeader } from './SectionHeader';

type StakingSectionProps = {
	tokenBalanceFormatted?: string;
	allowanceFormatted?: string;
	stakedBalanceFormatted?: string;
	pendingRewardsFormatted?: string;
	errorMessage?: string;
	stakeAmount: string;
	onStakeAmountChange: (value: string) => void;
	isStakeAmountValid: boolean;
	needsApproval: boolean;
	onApprove: () => void;
	onStake: () => void;
	isApprovePending: boolean;
	isApproveConfirming: boolean;
	isStakePending: boolean;
	isStakeConfirming: boolean;
	unstakeAmount: string;
	onUnstakeAmountChange: (value: string) => void;
	isUnstakeAmountValid: boolean;
	canUnstake: boolean;
	onUnstake: () => void;
	isUnstakePending: boolean;
	isUnstakeConfirming: boolean;
	canClaim: boolean;
	onClaimRewards: () => void;
	isClaimPending: boolean;
	isClaimConfirming: boolean;
};

export function StakingSection({
	tokenBalanceFormatted,
	allowanceFormatted,
	stakedBalanceFormatted,
	pendingRewardsFormatted,
	errorMessage,
	stakeAmount,
	onStakeAmountChange,
	isStakeAmountValid,
	needsApproval,
	onApprove,
	onStake,
	isApprovePending,
	isApproveConfirming,
	isStakePending,
	isStakeConfirming,
	unstakeAmount,
	onUnstakeAmountChange,
	isUnstakeAmountValid,
	canUnstake,
	onUnstake,
	isUnstakePending,
	isUnstakeConfirming,
	canClaim,
	onClaimRewards,
	isClaimPending,
	isClaimConfirming,
}: StakingSectionProps) {
	return (
		<section className="workspace-panel">
			<SectionHeader
				kicker="Core yield"
				title="Staking"
				description="Lock the base token and accrue protocol-funded rewards in the same asset."
				badges={[
					{ label: 'TKA', kind: 'staking' },
					{ label: 'Yield', kind: 'reward' },
				]}
			/>
			<div className="stats-list">
				<p>
					<span>Wallet balance</span>
					<strong>{tokenBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Allowance</span>
					<strong>{allowanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Staked</span>
					<strong>{stakedBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Claimable</span>
					<strong>{pendingRewardsFormatted ?? 'Loading...'}</strong>
				</p>
			</div>

			<div className="action-group">
				<AmountField
					label="Stake amount"
					value={stakeAmount}
					onChange={onStakeAmountChange}
					placeholder="Enter amount to stake"
					tokenLabel="TKA"
					tokenKind="staking"
					error={
						stakeAmount && !isStakeAmountValid
							? 'Invalid amount format. Use a dot for decimals.'
							: undefined
					}
				/>

				<p className="helper-note">
					Approve the current amount, then submit the stake once allowance is ready.
				</p>
				{errorMessage ? <p className="field-error">{errorMessage}</p> : null}

				<div className="button-row">
					{needsApproval ? (
						<button
							onClick={() => onApprove()}
							disabled={
								!isStakeAmountValid || isApprovePending || isApproveConfirming
							}
						>
							{isApprovePending || isApproveConfirming ? 'Approving...' : 'Approve'}
						</button>
					) : (
						<button
							onClick={() => onStake()}
							disabled={!isStakeAmountValid || isStakePending || isStakeConfirming}
						>
							{isStakePending || isStakeConfirming ? 'Staking...' : 'Stake'}
						</button>
					)}
				</div>
			</div>

			<div className="action-group action-group--subtle">
				<AmountField
					label="Unstake amount"
					value={unstakeAmount}
					onChange={onUnstakeAmountChange}
					placeholder="Enter amount to unstake"
					tokenLabel="TKA"
					tokenKind="staking"
					error={
						unstakeAmount && !isUnstakeAmountValid
							? 'Invalid unstake amount format. Use a dot for decimals.'
							: undefined
					}
				/>

				<p className="helper-note">
					Use unstake to reduce principal, or claim rewards separately if you want
					to keep the position open.
				</p>

				<div className="button-row">
					<button
						onClick={() => onUnstake()}
						disabled={!canUnstake || isUnstakePending || isUnstakeConfirming}
					>
						{isUnstakePending || isUnstakeConfirming ? 'Unstaking...' : 'Unstake'}
					</button>

					<button
						className="secondary-button"
						onClick={() => onClaimRewards()}
						disabled={!canClaim || isClaimPending || isClaimConfirming}
					>
						{isClaimPending || isClaimConfirming ? 'Claiming...' : 'Claim Rewards'}
					</button>
				</div>
			</div>
		</section>
	);
}
