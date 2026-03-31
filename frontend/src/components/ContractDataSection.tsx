import { SectionHeader } from './SectionHeader';

type ContractDataSectionProps = {
	tokenName?: string;
	tokenSymbol?: string;
	totalSupply?: bigint;
	reserveA?: bigint;
	reserveB?: bigint;
};

export function ContractDataSection({
	tokenName,
	tokenSymbol,
	totalSupply,
	reserveA,
	reserveB,
}: ContractDataSectionProps) {
	return (
		<section className="workspace-panel workspace-panel--overview">
			<SectionHeader
				kicker="Overview"
				title="Market Snapshot"
				description="Token metadata and live reserve levels for the deployed pool pair."
				badges={[
					{ label: tokenSymbol ?? 'TKA', kind: 'token-a' },
					{ label: 'TKB', kind: 'token-b' },
				]}
			/>
			<div className="metrics-grid">
				<div className="metric">
					<span className="metric-label">Token</span>
					<p className="metric-value">{tokenName ?? 'Loading...'}</p>
				</div>
				<div className="metric">
					<span className="metric-label">Symbol</span>
					<p className="metric-value">{tokenSymbol ?? 'Loading...'}</p>
				</div>
				<div className="metric">
					<span className="metric-label">Total supply</span>
					<p className="metric-value metric-value--mono">
						{totalSupply !== undefined ? totalSupply.toString() : 'Loading...'}
					</p>
				</div>
				<div className="metric">
					<span className="metric-label">Reserve A</span>
					<p className="metric-value metric-value--mono">
						{reserveA !== undefined ? reserveA.toString() : 'Loading...'}
					</p>
				</div>
				<div className="metric">
					<span className="metric-label">Reserve B</span>
					<p className="metric-value metric-value--mono">
						{reserveB !== undefined ? reserveB.toString() : 'Loading...'}
					</p>
				</div>
			</div>
		</section>
	);
}
