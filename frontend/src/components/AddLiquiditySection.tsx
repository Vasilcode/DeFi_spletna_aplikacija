import { AmountField } from './AmountField';
import { SectionHeader } from './SectionHeader';

type AddLiquiditySectionProps = {
	tokenABalanceFormatted?: string;
	tokenBBalanceFormatted?: string;
	allowanceAFormatted?: string;
	allowanceBFormatted?: string;
	lpBalanceFormatted?: string;
	estimatedLpMintedFormatted?: string;
	projectedSharePercent?: string;
	poolRatioDisplay?: string;
	errorMessage?: string;
	liquidityAmountA: string;
	onLiquidityAmountAChange: (value: string) => void;
	isAmountAValid: boolean;
	liquidityAmountB: string;
	onLiquidityAmountBChange: (value: string) => void;
	isAmountBValid: boolean;
	needsApprovalA: boolean;
	needsApprovalB: boolean;
	canAddLiquidity: boolean;
	onApproveA: () => void;
	onApproveB: () => void;
	onAddLiquidity: () => void;
	isApproveAPending: boolean;
	isApproveAConfirming: boolean;
	isApproveBPending: boolean;
	isApproveBConfirming: boolean;
	isAddLiquidityPending: boolean;
	isAddLiquidityConfirming: boolean;
};

export function AddLiquiditySection({
	tokenABalanceFormatted,
	tokenBBalanceFormatted,
	allowanceAFormatted,
	allowanceBFormatted,
	lpBalanceFormatted,
	estimatedLpMintedFormatted,
	projectedSharePercent,
	poolRatioDisplay,
	errorMessage,
	liquidityAmountA,
	onLiquidityAmountAChange,
	isAmountAValid,
	liquidityAmountB,
	onLiquidityAmountBChange,
	isAmountBValid,
	needsApprovalA,
	needsApprovalB,
	canAddLiquidity,
	onApproveA,
	onApproveB,
	onAddLiquidity,
	isApproveAPending,
	isApproveAConfirming,
	isApproveBPending,
	isApproveBConfirming,
	isAddLiquidityPending,
	isAddLiquidityConfirming,
}: AddLiquiditySectionProps) {
	return (
		<section className="workspace-panel">
			<SectionHeader
				kicker="DEX entry"
				title="Add Liquidity"
				description="Deposit both pool assets at the live ratio to mint LP and deepen the pair."
				badges={[
					{ label: 'TKA', kind: 'token-a' },
					{ label: 'TKB', kind: 'token-b' },
					{ label: 'LP', kind: 'lp' },
				]}
			/>
			<div className="stats-list">
				<p>
					<span>Token A balance</span>
					<strong>{tokenABalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Token B balance</span>
					<strong>{tokenBBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Token A allowance</span>
					<strong>{allowanceAFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Token B allowance</span>
					<strong>{allowanceBFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>LP balance</span>
					<strong>{lpBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Estimated LP minted</span>
					<strong>{estimatedLpMintedFormatted ?? 'Enter both amounts'}</strong>
				</p>
				<p>
					<span>Projected pool share</span>
					<strong>{projectedSharePercent ?? 'Enter both amounts'}</strong>
				</p>
				<p>
					<span>Pool ratio</span>
					<strong>{poolRatioDisplay ?? 'Loading...'}</strong>
				</p>
			</div>

			<div className="field-grid">
				<AmountField
					label="Token A amount"
					value={liquidityAmountA}
					onChange={onLiquidityAmountAChange}
					placeholder="Token A amount"
					tokenLabel="TKA"
					tokenKind="token-a"
					hint="Base-side deposit into the pool."
					error={
						liquidityAmountA && !isAmountAValid
							? 'Invalid Token A amount format.'
							: undefined
					}
				/>

				<AmountField
					label="Token B amount"
					value={liquidityAmountB}
					onChange={onLiquidityAmountBChange}
					placeholder="Token B amount"
					tokenLabel="TKB"
					tokenKind="token-b"
					hint="Quote-side deposit paired with Token A."
					error={
						liquidityAmountB && !isAmountBValid
							? 'Invalid Token B amount format.'
							: undefined
					}
				/>
			</div>

			<p className="helper-note">
				Approve each side for the entered amounts, then submit the pair together.
			</p>
			{errorMessage ? <p className="field-error">{errorMessage}</p> : null}

			<div className="button-row">
				{needsApprovalA ? (
					<button
						onClick={() => onApproveA()}
						disabled={!isAmountAValid || isApproveAPending || isApproveAConfirming}
					>
						{isApproveAPending || isApproveAConfirming
							? 'Approving A...'
							: 'Approve Token A'}
					</button>
				) : null}

				{needsApprovalB ? (
					<button
						onClick={() => onApproveB()}
						disabled={!isAmountBValid || isApproveBPending || isApproveBConfirming}
					>
						{isApproveBPending || isApproveBConfirming
							? 'Approving B...'
							: 'Approve Token B'}
					</button>
				) : null}

				<button
					onClick={() => onAddLiquidity()}
					disabled={!canAddLiquidity || isAddLiquidityPending || isAddLiquidityConfirming}
				>
					{isAddLiquidityPending || isAddLiquidityConfirming
						? 'Adding Liquidity...'
						: 'Add Liquidity'}
				</button>
			</div>
		</section>
	);
}
