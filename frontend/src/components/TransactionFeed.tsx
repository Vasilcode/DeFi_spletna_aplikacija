export type TransactionFeedItem = {
	id: string;
	kind: 'pending' | 'success' | 'error';
	title: string;
	detail: string;
};

type TransactionFeedProps = {
	items: TransactionFeedItem[];
};

export function TransactionFeed({ items }: TransactionFeedProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className="transaction-feed" aria-live="polite" aria-label="Transaction activity">
			{items.map((item) => (
				<div
					key={item.id}
					className={`transaction-feed__item transaction-feed__item--${item.kind}`}
				>
					<div className="transaction-feed__header">
						<span className="transaction-feed__dot" aria-hidden="true" />
						<strong>{item.title}</strong>
					</div>
					<p>{item.detail}</p>
				</div>
			))}
		</div>
	);
}
