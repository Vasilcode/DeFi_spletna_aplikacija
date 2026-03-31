import { TokenBadge } from './TokenBadge';

type AmountFieldKind =
	| 'wallet'
	| 'analytics'
	| 'token-a'
	| 'token-b'
	| 'lp'
	| 'reward'
	| 'staking'
	| 'swap';

type AmountFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	error?: string;
	hint?: string;
	tokenLabel?: string;
	tokenKind?: AmountFieldKind;
};

export function AmountField({
	label,
	value,
	onChange,
	placeholder,
	error,
	hint,
	tokenLabel,
	tokenKind,
}: AmountFieldProps) {
	return (
		<div className="field-stack field-stack--enhanced">
			<label className="field-label">{label}</label>
			<div className="input-shell">
				<input
					type="text"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
				/>
				{tokenLabel && tokenKind ? (
					<div className="input-shell__badge">
						<TokenBadge label={tokenLabel} kind={tokenKind} compact />
					</div>
				) : null}
			</div>

			{hint ? <p className="field-hint">{hint}</p> : null}
			{error ? <p className="field-error">{error}</p> : null}
		</div>
	);
}
