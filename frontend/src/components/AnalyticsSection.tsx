import { SectionHeader } from './SectionHeader';

type AnalyticsSectionProps = {
	approxTvlFormatted?: string;
	stakingAprPercent?: string;
	farmingAprPercent?: string;
	errorMessage?: string;
};

export function AnalyticsSection({
	approxTvlFormatted,
	stakingAprPercent,
	farmingAprPercent,
	errorMessage,
}: AnalyticsSectionProps) {
	return (
		<section className="workspace-panel workspace-panel--overview">
			<SectionHeader
				kicker="Backend read layer"
				title="Analytics Snapshot"
				description="Read-only protocol metrics assembled by the backend aggregation layer."
				badges={[
					{ label: 'TVL', kind: 'analytics' },
					{ label: 'APR', kind: 'analytics' },
				]}
			/>
			<div className="metrics-grid">
				<div className="metric">
					<span className="metric-label">Approx. TVL</span>
					<p className="metric-value">{approxTvlFormatted ?? 'Loading...'}</p>
				</div>
				<div className="metric">
					<span className="metric-label">Staking APR</span>
					<p className="metric-value">
						{stakingAprPercent ? `${stakingAprPercent}%` : 'Loading...'}
					</p>
				</div>
				<div className="metric">
					<span className="metric-label">Farming APR</span>
					<p className="metric-value">
						{farmingAprPercent ? `${farmingAprPercent}%` : 'Loading...'}
					</p>
				</div>
			</div>
			{errorMessage ? <p className="field-error">{errorMessage}</p> : null}
		</section>
	);
}
