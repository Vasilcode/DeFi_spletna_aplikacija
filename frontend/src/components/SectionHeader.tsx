import { TokenBadge } from './TokenBadge';

type SectionHeaderBadge = {
	label: string;
	kind:
		| 'wallet'
		| 'analytics'
		| 'token-a'
		| 'token-b'
		| 'lp'
		| 'reward'
		| 'staking'
		| 'swap';
};

type SectionHeaderProps = {
	kicker: string;
	title: string;
	description?: string;
	badges?: SectionHeaderBadge[];
};

export function SectionHeader({
	kicker,
	title,
	description,
	badges = [],
}: SectionHeaderProps) {
	return (
		<header className="section-header">
			<div className="section-header__copy">
				<p className="section-kicker">{kicker}</p>
				<h2>{title}</h2>
				{description ? <p className="support-copy">{description}</p> : null}
			</div>

			{badges.length > 0 ? (
				<div className="section-header__badges">
					{badges.map((badge) => (
						<TokenBadge key={`${title}-${badge.label}`} label={badge.label} kind={badge.kind} />
					))}
				</div>
			) : null}
		</header>
	);
}
