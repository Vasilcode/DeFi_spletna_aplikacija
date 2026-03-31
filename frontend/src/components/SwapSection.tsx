import { AmountField } from './AmountField';
import { SectionHeader } from './SectionHeader';

type SwapSectionProps = {
	tokenInLabel: string;
	tokenOutLabel: string;
	inputBalanceFormatted?: string;
	swapAllowanceFormatted?: string;
	expectedAmountOutFormatted?: string;
	minAmountOutFormatted?: string;
	poolPriceDisplay?: string;
	estimatedGasFormatted?: string;
	poolAddress: string;
	isHighSlippage: boolean;
	swapDirection: 'A_TO_B' | 'B_TO_A';
	onSwapDirectionChange: (value: 'A_TO_B' | 'B_TO_A') => void;
	swapAmountIn: string;
	onSwapAmountInChange: (value: string) => void;
	isAmountInValid: boolean;
	swapSlippagePercent: string;
	onSwapSlippagePercentChange: (value: string) => void;
	isSlippageValid: boolean;
	swapNeedsApproval: boolean;
	canSwap: boolean;
	errorMessage?: string;
	onApproveSwapToken: () => void;
	onSwap: () => void;
	isSwapApprovePending: boolean;
	isSwapApproveConfirming: boolean;
	isSwapPending: boolean;
	isSwapConfirming: boolean;
};

export function SwapSection({
	tokenInLabel,
	tokenOutLabel,
	inputBalanceFormatted,
	swapAllowanceFormatted,
	expectedAmountOutFormatted,
	minAmountOutFormatted,
	poolPriceDisplay,
	estimatedGasFormatted,
	poolAddress,
	isHighSlippage,
	swapDirection,
	onSwapDirectionChange,
	swapAmountIn,
	onSwapAmountInChange,
	isAmountInValid,
	swapSlippagePercent,
	onSwapSlippagePercentChange,
	isSlippageValid,
	swapNeedsApproval,
	canSwap,
	errorMessage,
	onApproveSwapToken,
	onSwap,
	isSwapApprovePending,
	isSwapApproveConfirming,
	isSwapPending,
	isSwapConfirming,
}: SwapSectionProps) {
	return (
		<section className="workspace-panel">
			<SectionHeader
				kicker="Execution"
				title="Swap"
				description="Review expected output, set slippage tolerance and submit a protected swap."
				badges={[
					{
						label: swapDirection === 'A_TO_B' ? 'TKA -> TKB' : 'TKB -> TKA',
						kind: 'swap',
					},
				]}
			/>
			<div className="stats-list">
				<p>
					<span>Direction</span>
					<strong>
						{tokenInLabel} -&gt; {tokenOutLabel}
					</strong>
				</p>
				<p>
					<span>Input balance</span>
					<strong>{inputBalanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Allowance</span>
					<strong>{swapAllowanceFormatted ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Expected output</span>
					<strong>{expectedAmountOutFormatted ?? 'Enter amount in'}</strong>
				</p>
				<p>
					<span>Minimum received</span>
					<strong>{minAmountOutFormatted ?? 'Set slippage'}</strong>
				</p>
				<p>
					<span>Pool price</span>
					<strong>{poolPriceDisplay ?? 'Loading...'}</strong>
				</p>
				<p>
					<span>Estimated gas</span>
					<strong>{estimatedGasFormatted ?? 'Available before submit'}</strong>
				</p>
				<p>
					<span>Pool contract</span>
					<strong className="meta-value--mono">{poolAddress}</strong>
				</p>
			</div>

			<div className="field-grid">
				<div className="field-stack">
					<label className="field-label">Direction</label>
					<select
						value={swapDirection}
						onChange={(event) =>
							onSwapDirectionChange(event.target.value as 'A_TO_B' | 'B_TO_A')
						}
					>
						<option value="A_TO_B">Token A -&gt; Token B</option>
						<option value="B_TO_A">Token B -&gt; Token A</option>
					</select>
				</div>

				<AmountField
					label="Amount in"
					value={swapAmountIn}
					onChange={onSwapAmountInChange}
					placeholder="Amount in"
					tokenLabel={swapDirection === 'A_TO_B' ? 'TKA' : 'TKB'}
					tokenKind={swapDirection === 'A_TO_B' ? 'token-a' : 'token-b'}
					hint="Input side of the swap."
					error={swapAmountIn && !isAmountInValid ? 'Invalid input amount.' : undefined}
				/>

				<AmountField
					label="Slippage tolerance (%)"
					value={swapSlippagePercent}
					onChange={onSwapSlippagePercentChange}
					placeholder="Example: 0.5"
					tokenLabel="%"
					tokenKind="swap"
					hint="Lower values protect price but may increase failed transactions."
					error={
						swapSlippagePercent && !isSlippageValid
							? 'Use a value between 0 and 50.'
							: undefined
					}
				/>
			</div>

			<p className="helper-note">
				Minimum received is derived from slippage tolerance before the transaction
				is signed.
			</p>
			{isHighSlippage ? (
				<p className="field-error">
					High slippage tolerance increases the chance of a materially worse fill.
				</p>
			) : null}

			{errorMessage ? <p className="field-error">{errorMessage}</p> : null}

			<div className="button-row">
				{swapNeedsApproval ? (
					<button
						onClick={() => onApproveSwapToken()}
						disabled={
							!isAmountInValid || isSwapApprovePending || isSwapApproveConfirming
						}
					>
						{isSwapApprovePending || isSwapApproveConfirming
							? 'Approving swap token...'
							: 'Approve Swap Token'}
					</button>
				) : (
					<button
						onClick={() => onSwap()}
						disabled={!canSwap || isSwapPending || isSwapConfirming}
					>
						{isSwapPending || isSwapConfirming ? 'Swapping...' : 'Swap'}
					</button>
				)}
			</div>
		</section>
	);
}
