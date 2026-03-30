import { QueryClient } from '@tanstack/react-query';
import { defineChain, http } from 'viem';
import { createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

const chainId = Number(import.meta.env.VITE_APP_CHAIN_ID);
const rpcUrl = import.meta.env.VITE_APP_RPC_URL;

if (!chainId) {
	throw new Error('Missing VITE_APP_CHAIN_ID environment variable');
}

if (!rpcUrl) {
	throw new Error('Missing VITE_APP_RPC_URL environment variable');
}

const isSepolia = chainId === 11155111;

export const appChain = defineChain({
	id: chainId,
	name: isSepolia ? 'Sepolia' : 'Local Hardhat',
	nativeCurrency: {
		name: 'Ether',
		symbol: 'ETH',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [rpcUrl],
		},
	},
	blockExplorers: isSepolia
		? {
				default: {
					name: 'Etherscan',
					url: 'https://sepolia.etherscan.io',
				},
			}
		: undefined,
	testnet: true,
});

export const wagmiConfig = createConfig({
	chains: [appChain],
	connectors: [injected()],
	transports: {
		[appChain.id]: http(rpcUrl),
	},
});

export const queryClient = new QueryClient();

declare module 'wagmi' {
	interface Register {
		config: typeof wagmiConfig;
	}
}
