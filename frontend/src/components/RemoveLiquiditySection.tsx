import { AmountField } from './AmountField';
import { SectionHeader } from './SectionHeader';

type RemoveLiquiditySectionProps = {
	lpBalanceFormatted?: string;
	removeLiquidityAmount: string;
	onRemoveLiquidityAmountChange: (value: string) => void;
	isRemoveLiquidityAmountValid: boolean;
	errorMessage?: string;
	canRemove: boolean;
	onRemoveLiquidity: () => void;
	isRemoveLiquidityPending: boolean;
	isRemoveLiquidityConfirming: boolean;
};

export function RemoveLiquiditySection({
	lpBalanceFormatted,
	removeLiquidityAmount,
	onRemoveLiquidityAmountChange,
	isRemoveLiquidityAmountValid,
	errorMessage,
	canRemove,
	onRemoveLiquidity,
	isRemoveLiquidityPending,
	isRemoveLiquidityConfirming,
}: RemoveLiquiditySectionProps) {
	return (
		<section className="workspace-panel workspace-panel--compact">
			<SectionHeader
				kicker="Exit"
				title="Remove Liquidity"
				description="Burn LP to withdraw both sides of the pool in the current ratio."
				badges={[{ label: 'LP', kind: 'lp' }]}
			/>
			<p className="helper-note">
				LP token balance: <strong>{lpBalanceFormatted ?? 'Loading...'}</strong>
			</p>

			<AmountField
				label="LP amount"
				value={removeLiquidityAmount}
				onChange={onRemoveLiquidityAmountChange}
				placeholder="LP amount to remove"
				tokenLabel="LP"
				tokenKind="lp"
				hint="Burn this LP amount to receive both pool assets back."
				error={
					removeLiquidityAmount && !isRemoveLiquidityAmountValid
						? 'Invalid LP amount format.'
						: undefined
				}
			/>
			{errorMessage ? <p className="field-error">{errorMessage}</p> : null}

			<button
				onClick={() => onRemoveLiquidity()}
				disabled={!canRemove || isRemoveLiquidityPending || isRemoveLiquidityConfirming}
			>
				{isRemoveLiquidityPending || isRemoveLiquidityConfirming
					? 'Removing Liquidity...'
					: 'Remove Liquidity'}
			</button>
		</section>
	);
}
