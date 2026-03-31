import { useQuery } from '@tanstack/react-query';

type ProtocolOverview = {
	pool: {
		approxTvlFormatted: string;
	};
	staking: {
		approxAprPercent: string;
	};
	farming: {
		approxAprPercent: string;
	};
};

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

export function useBackendOverview() {
	return useQuery({
		queryKey: ['backend-overview'],
		queryFn: async (): Promise<ProtocolOverview> => {
			if (!backendUrl) {
				throw new Error('Missing VITE_APP_BACKEND_URL');
			}

			try {
				const response = await fetch(`${backendUrl}/api/protocol/overview`);
				if (!response.ok) {
					let detail = `Backend overview request failed with status ${response.status}`;

					try {
						const errorPayload = (await response.json()) as {
							error?: string;
							details?: string;
						};

						if (errorPayload.details) {
							detail = errorPayload.details;
						} else if (errorPayload.error) {
							detail = errorPayload.error;
						}
					} catch {
						// Ignore JSON parse issues and keep the HTTP status based message.
					}

					throw new Error(detail);
				}

				return response.json() as Promise<ProtocolOverview>;
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(
						`Backend read layer is unavailable. Start the backend with "cd backend && npm run dev". Details: ${error.message}`,
					);
				}

				throw new Error(
					'Backend read layer is unavailable. Start the backend with "cd backend && npm run dev".',
				);
			}
		},
		refetchInterval: 5000,
		retry: 1,
	});
}
