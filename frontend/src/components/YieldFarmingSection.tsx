import { AmountField } from './AmountField';
import { SectionHeader } from './SectionHeader';

type YieldFarmingSectionProps = {
	farmLpBalanceFormatted?: string;
	farmAllowanceFormatted?: string;
	farmStakedBalanceFormatted?: string;
	farmPendingRewardsFormatted?: string;
	errorMessage?: string;
	farmStakeAmount: string;
	onFarmStakeAmountChange: (value: string) => void;
	isFarmStakeAmountValid: boolean;
	farmingNeedsApproval: boolean;
	onApproveFarming: () => void;
	onStakeFarming: () => void;
	isFarmApprovePending: boolean;
	isFarmApproveConfirming: boolean;
	isFarmStakePending: boolean;
	isFarmStakeConfirming: boolean;
	farmUnstakeAmount: string;
	onFarmUnstakeAmountChange: (value: string) => void;
	isFarmUnstakeAmountValid: boolean;
	canFarmUnstake: boolean;
	onUnstakeFarming: () => void;
	isFarmUnstakePending: boolean;
	isFarmUnstakeConfirming: boolean;
	canFarmClaim: boolean;
	onClaimFarmingRewards: () => void;
	isFarmClaimPending: boolean;
	isFarmClaimConfirming: boolean;
};

export function YieldFarmingSection({
	farmLpBalanceFormatted,
	farmAllowanceFormatted,
	farmStakedBalanceFormatted,
	farmPendingRewardsFormatted,
	errorMessage,
	farmStakeAmount,
	onFarmStakeAmountChange,
	isFarmStakeAmountValid,
	farmingNeedsApproval,
	onApproveFarming,
	onStakeFarming,
	isFarmApprovePending,
	isFarmApproveConfirming,
	isFarmStakePending,
	isFarmStakeConfirming,
	farmUnstakeAmount,
	onFarmUnstakeAmountChange,
	isFarmUnstakeAmountValid,
	canFarmUnstake,
	onUnstakeFarming,
	isFarmUnstakePending,
	isFarmUnstakeConfirming,
	canFarmClaim,
	onClaimFarmingRewards,
	isFarmClaimPending,
	isFarmClaimConfirming,
}: YieldFarmingSectionProps) {
	return (
		<section className="workspace-panel">
			<SectionHeader
				kicker="LP rewards"
				title="Yield Farming"
				description="Stake LP positions to earn the separate reward token funded into the farm."
				badges={[
					{ label: 'LP', kind: 'lp' },
					{ label: 'RWD', kind: 'reward' },
				]}
			/>
			<div className="stats-list">
				<p>
					<span>LP balance</span>
					<strong>{farmLpBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Allowance</span>
					<strong>{farmAllowanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Farmed</span>
					<strong>{farmStakedBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Claimable rewards</span>
					<strong>{farmPendingRewardsFormatted ?? 'Loading...'}</strong>
				</p>
			</div>

			<div className="action-group">
				<AmountField
					label="LP amount to farm"
					value={farmStakeAmount}
					onChange={onFarmStakeAmountChange}
					placeholder="LP amount to farm"
					tokenLabel="LP"
					tokenKind="lp"
					error={
						farmStakeAmount && !isFarmStakeAmountValid
							? 'Invalid farming stake amount format.'
							: undefined
					}
				/>

				<p className="helper-note">
					Approve the entered LP amount, then move it into the farming contract.
				</p>
				{errorMessage ? <p className="field-error">{errorMessage}</p> : null}

				<div className="button-row">
					{farmingNeedsApproval ? (
						<button
							onClick={() => onApproveFarming()}
							disabled={
								!isFarmStakeAmountValid ||
								isFarmApprovePending ||
								isFarmApproveConfirming
							}
						>
							{isFarmApprovePending || isFarmApproveConfirming
								? 'Approving LP...'
								: 'Approve LP'}
						</button>
					) : (
						<button
							onClick={() => onStakeFarming()}
							disabled={
								!isFarmStakeAmountValid ||
								isFarmStakePending ||
								isFarmStakeConfirming
							}
						>
							{isFarmStakePending || isFarmStakeConfirming
								? 'Farming...'
								: 'Stake LP'}
						</button>
					)}
				</div>
			</div>

			<div className="action-group action-group--subtle">
				<AmountField
					label="LP amount to unstake"
					value={farmUnstakeAmount}
					onChange={onFarmUnstakeAmountChange}
					placeholder="LP amount to unstake from farming"
					tokenLabel="LP"
					tokenKind="lp"
					error={
						farmUnstakeAmount && !isFarmUnstakeAmountValid
							? 'Invalid farming unstake amount format.'
							: undefined
					}
				/>

				<p className="helper-note">
					Claimable rewards refresh on-chain, so a small stake or unstake can
					force an updated accrual snapshot.
				</p>

				<div className="button-row">
					<button
						onClick={() => onUnstakeFarming()}
						disabled={!canFarmUnstake || isFarmUnstakePending || isFarmUnstakeConfirming}
					>
						{isFarmUnstakePending || isFarmUnstakeConfirming
							? 'Unstaking LP...'
							: 'Unstake LP'}
					</button>

					<button
						className="secondary-button"
						onClick={() => onClaimFarmingRewards()}
						disabled={!canFarmClaim || isFarmClaimPending || isFarmClaimConfirming}
					>
						{isFarmClaimPending || isFarmClaimConfirming
							? 'Claiming farming rewards...'
							: 'Claim Farming Rewards'}
					</button>
				</div>
			</div>
		</section>
	);
}
