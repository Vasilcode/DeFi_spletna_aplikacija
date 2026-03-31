type TokenBadgeKind =
	| 'wallet'
	| 'analytics'
	| 'token-a'
	| 'token-b'
	| 'lp'
	| 'reward'
	| 'staking'
	| 'swap';

type TokenBadgeProps = {
	label: string;
	kind: TokenBadgeKind;
	compact?: boolean;
};

function TokenGlyph({ kind }: { kind: TokenBadgeKind }) {
	switch (kind) {
		case 'wallet':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<rect x="4" y="6.5" width="16" height="11" rx="3.2" />
					<path d="M16 12h3.5" />
					<circle cx="16.8" cy="12" r="0.9" fill="currentColor" stroke="none" />
				</svg>
			);
		case 'analytics':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<path d="M5 18.5h14" />
					<rect x="6.2" y="11.5" width="2.6" height="5" rx="1" />
					<rect x="10.7" y="8.5" width="2.6" height="8" rx="1" />
					<rect x="15.2" y="6" width="2.6" height="10.5" rx="1" />
				</svg>
			);
		case 'token-a':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<circle cx="12" cy="12" r="8" />
					<path d="M9 15.5L12 8.5l3 7" />
					<path d="M10.1 13.3h3.8" />
				</svg>
			);
		case 'token-b':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<circle cx="12" cy="12" r="8" />
					<path d="M10 8.5h3.1a2.2 2.2 0 010 4.4H10z" />
					<path d="M10 12.9h3.7a2.3 2.3 0 010 4.6H10z" />
					<path d="M10 8v9" />
				</svg>
			);
		case 'lp':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<circle cx="9" cy="12" r="4.5" />
					<circle cx="15" cy="12" r="4.5" />
					<path d="M10.7 12h2.6" />
				</svg>
			);
		case 'reward':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<path d="M12 5.5l1.8 3.7 4.1.6-2.9 2.8.7 4-3.7-2-3.7 2 .7-4-2.9-2.8 4.1-.6z" />
				</svg>
			);
		case 'staking':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<path d="M12 4.8l5.2 3v6L12 17.2 6.8 13.8v-6z" />
					<path d="M12 8v5.5" />
					<path d="M9.6 10.6l2.4-2.6 2.4 2.6" />
				</svg>
			);
		case 'swap':
			return (
				<svg viewBox="0 0 24 24" className="token-badge__svg" aria-hidden="true">
					<path d="M7 8h9" />
					<path d="M13.5 5.5L17 8l-3.5 2.5" />
					<path d="M17 16H8" />
					<path d="M10.5 13.5L7 16l3.5 2.5" />
				</svg>
			);
	}
}

export function TokenBadge({ label, kind, compact = false }: TokenBadgeProps) {
	return (
		<span className={`token-badge${compact ? ' token-badge--compact' : ''}`}>
			<span className={`token-badge__glyph token-badge__glyph--${kind}`}>
				<TokenGlyph kind={kind} />
			</span>
			<span className="token-badge__label">{label}</span>
		</span>
	);
}
