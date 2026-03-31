import { useEffect, useRef, useState } from 'react';
import type { TransactionFeedItem } from '../components/TransactionFeed';

type TransactionSource = {
	id: string;
	label: string;
	active: boolean;
	error?: string;
};

function scheduleRemoval(
	id: string,
	timeoutMs: number,
	remove: (id: string) => void,
	registry: Map<string, number>,
) {
	const existing = registry.get(id);
	if (existing) {
		window.clearTimeout(existing);
	}

	const handle = window.setTimeout(() => {
		remove(id);
		registry.delete(id);
	}, timeoutMs);

	registry.set(id, handle);
}

export function useTransactionFeed(sources: TransactionSource[]) {
	const [items, setItems] = useState<TransactionFeedItem[]>([]);
	const previousActive = useRef<Record<string, boolean>>({});
	const previousError = useRef<Record<string, string | undefined>>({});
	const timeouts = useRef<Map<string, number>>(new Map());

	useEffect(() => {
		const removeItem = (id: string) => {
			setItems((current) => current.filter((item) => item.id !== id));
		};

		sources.forEach((source) => {
			const pendingId = `pending-${source.id}`;
			const previousWasActive = previousActive.current[source.id] ?? false;
			const previousErrorMessage = previousError.current[source.id];

			if (source.active && !previousWasActive) {
				setItems((current) => {
					const withoutPending = current.filter((item) => item.id !== pendingId);
					const pendingItem: TransactionFeedItem = {
						id: pendingId,
						kind: 'pending',
						title: source.label,
						detail: 'Transaction in progress. Review wallet prompts and wait for confirmation.',
					};

					return [
						pendingItem,
						...withoutPending,
					].slice(0, 4);
				});
			}

			if (!source.active && previousWasActive) {
				setItems((current) => current.filter((item) => item.id !== pendingId));

				if (!source.error) {
					const successId = `success-${source.id}-${Date.now()}`;
					setItems((current) => [
						{
							id: successId,
							kind: 'success' as const,
							title: source.label,
							detail: 'Transaction confirmed and protocol state refreshed.',
						},
						...current,
					].slice(0, 4));

					scheduleRemoval(successId, 4200, removeItem, timeouts.current);
				}
			}

			if (source.error && source.error !== previousErrorMessage) {
				setItems((current) => current.filter((item) => item.id !== pendingId));

				const errorId = `error-${source.id}-${Date.now()}`;
				const errorDetail = source.error;
				setItems((current) => [
					{
						id: errorId,
						kind: 'error' as const,
						title: source.label,
						detail: errorDetail,
					},
					...current,
				].slice(0, 4));

				scheduleRemoval(errorId, 6500, removeItem, timeouts.current);
			}

			previousActive.current[source.id] = source.active;
			previousError.current[source.id] = source.error;
		});
	}, [sources]);

	useEffect(() => {
		const timeoutRegistry = timeouts.current;

		return () => {
			timeoutRegistry.forEach((handle) => window.clearTimeout(handle));
			timeoutRegistry.clear();
		};
	}, []);

	return items;
}
