import type { Address } from 'viem';

function getRequiredEnv(name: string) {
	const value = import.meta.env[name];
	if (!value) {
		throw new Error(`Missing ${name} environment variable`);
	}
	return value;
}

export const contracts = {
	token: getRequiredEnv('VITE_APP_TOKEN_ADDRESS') as Address,
	tokenB: getRequiredEnv('VITE_APP_TOKEN_B_ADDRESS') as Address,
	pool: getRequiredEnv('VITE_APP_POOL_ADDRESS') as Address,
	staking: getRequiredEnv('VITE_APP_STAKING_ADDRESS') as Address,
	farming: getRequiredEnv('VITE_APP_FARMING_ADDRESS') as Address,
};
