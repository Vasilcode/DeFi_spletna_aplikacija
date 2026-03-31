import { SectionHeader } from './SectionHeader';

type WalletStatusSectionProps = {
	address?: string;
	chainId?: number;
	nativeBalance?: string;
	nativeBalanceSymbol?: string;
	onDisconnect: () => void;
};

export function WalletStatusSection({
	address,
	chainId,
	nativeBalance,
	nativeBalanceSymbol,
	onDisconnect,
}: WalletStatusSectionProps) {
	return (
		<section className="workspace-panel workspace-panel--status">
			<SectionHeader
				kicker="Session"
				title="Wallet Status"
				description="Connected signer, active chain and native gas budget for the current session."
				badges={[
					{ label: 'Wallet', kind: 'wallet' },
					{ label: nativeBalanceSymbol ?? 'ETH', kind: 'wallet' },
				]}
			/>
			<div className="meta-grid">
				<div>
					<span className="meta-label">Address</span>
					<p className="meta-value meta-value--mono">{address}</p>
				</div>
				<div>
					<span className="meta-label">Chain</span>
					<p className="meta-value">{chainId}</p>
				</div>
				<div>
					<span className="meta-label">Native balance</span>
					<p className="meta-value">
						{nativeBalance ?? 'Loading...'} {nativeBalanceSymbol ?? ''}
					</p>
				</div>
			</div>
			<button className="secondary-button" onClick={() => onDisconnect()}>
				Disconnect
			</button>
		</section>
	);
}
