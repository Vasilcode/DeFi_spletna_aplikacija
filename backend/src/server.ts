import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { createPublicClient, defineChain, formatUnits, http, isAddress, parseAbi, type Address } from 'viem';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const chainId = Number(process.env.VITE_APP_CHAIN_ID) || 31337;
const rpcUrl = process.env.VITE_APP_RPC_URL;

if (!rpcUrl) {
	throw new Error('Missing VITE_APP_RPC_URL');
}

const requiredContracts = {
	tokenA: process.env.VITE_APP_TOKEN_ADDRESS,
	tokenB: process.env.VITE_APP_TOKEN_B_ADDRESS,
	pool: process.env.VITE_APP_POOL_ADDRESS,
	staking: process.env.VITE_APP_STAKING_ADDRESS,
	farming: process.env.VITE_APP_FARMING_ADDRESS,
	rewardToken: process.env.VITE_APP_REWARD_TOKEN_ADDRESS,
};

for (const [name, value] of Object.entries(requiredContracts)) {
	if (!value || !isAddress(value)) {
		throw new Error(`Missing or invalid ${name} address`);
	}
}

const contracts = {
	tokenA: requiredContracts.tokenA as Address,
	tokenB: requiredContracts.tokenB as Address,
	pool: requiredContracts.pool as Address,
	staking: requiredContracts.staking as Address,
	farming: requiredContracts.farming as Address,
	rewardToken: requiredContracts.rewardToken as Address,
};

const appChain = defineChain({
	id: chainId,
	name: chainId === 11155111 ? 'Sepolia' : 'Local Hardhat',
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
	testnet: true,
});

const client = createPublicClient({
	chain: appChain,
	transport: http(rpcUrl),
});

const erc20Abi = parseAbi([
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address) view returns (uint256)',
]);

const liquidityPoolAbi = parseAbi([
	'function lpToken() view returns (address)',
	'function getReserves() view returns (uint256, uint256)',
]);

const stakingAbi = parseAbi([
	'function rewardRatePerSecond() view returns (uint256)',
	'function totalStaked() view returns (uint256)',
	'function reservedRewards() view returns (uint256)',
	'function rewardsAvailableFrom() view returns (uint256)',
	'function pendingRewards(address) view returns (uint256)',
	'function stakedBalance(address) view returns (uint256)',
]);

const farmingAbi = parseAbi([
	'function lpToken() view returns (address)',
	'function rewardToken() view returns (address)',
	'function rewardRatePerSecond() view returns (uint256)',
	'function totalStaked() view returns (uint256)',
	'function reservedRewards() view returns (uint256)',
	'function rewardsAvailableFrom() view returns (uint256)',
	'function pendingRewards(address) view returns (uint256)',
	'function stakedBalance(address) view returns (uint256)',
]);

const SECONDS_PER_YEAR = 31_536_000n;
const PRECISION = 10n ** 18n;

function formatTokenAmount(value: bigint, decimals: number) {
	return formatUnits(value, decimals);
}

function formatPercent(value: bigint) {
	const whole = value / 100n;
	const fraction = value % 100n;
	return `${whole}.${fraction.toString().padStart(2, '0')}`;
}

function calculateAprPercent(
	rewardRatePerSecond: bigint,
	totalStaked: bigint,
) {
	if (totalStaked === 0n) {
		return '0.00';
	}

	const annualRewards = (rewardRatePerSecond * SECONDS_PER_YEAR) / PRECISION;
	const aprBasisPoints = (annualRewards * 10_000n) / totalStaked;
	return formatPercent(aprBasisPoints);
}

async function readToken(address: Address) {
	const [name, symbol, decimals, totalSupply] = await Promise.all([
		client.readContract({ address, abi: erc20Abi, functionName: 'name' }),
		client.readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
		client.readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
		client.readContract({
			address,
			abi: erc20Abi,
			functionName: 'totalSupply',
		}),
	]);

	return {
		address,
		name,
		symbol,
		decimals,
		totalSupply: totalSupply.toString(),
		totalSupplyFormatted: formatTokenAmount(totalSupply, decimals),
	};
}

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
	const liveChainId = await client.getChainId();

	res.status(200).json({
		status: 'ok',
		service: 'backend',
		chainId: liveChainId,
	});
});

app.get('/api/protocol/overview', async (_req, res) => {
	try {
		const [tokenA, tokenB, rewardToken] = await Promise.all([
			readToken(contracts.tokenA),
			readToken(contracts.tokenB),
			readToken(contracts.rewardToken),
		]);

		const [reserves, lpTokenAddress, stakingState, farmingState] = await Promise.all([
			client.readContract({
				address: contracts.pool,
				abi: liquidityPoolAbi,
				functionName: 'getReserves',
			}),
			client.readContract({
				address: contracts.pool,
				abi: liquidityPoolAbi,
				functionName: 'lpToken',
			}),
			Promise.all([
				client.readContract({
					address: contracts.staking,
					abi: stakingAbi,
					functionName: 'rewardRatePerSecond',
				}),
				client.readContract({
					address: contracts.staking,
					abi: stakingAbi,
					functionName: 'totalStaked',
				}),
				client.readContract({
					address: contracts.staking,
					abi: stakingAbi,
					functionName: 'reservedRewards',
				}),
				client.readContract({
					address: contracts.staking,
					abi: stakingAbi,
					functionName: 'rewardsAvailableFrom',
				}),
			]),
			Promise.all([
				client.readContract({
					address: contracts.farming,
					abi: farmingAbi,
					functionName: 'rewardRatePerSecond',
				}),
				client.readContract({
					address: contracts.farming,
					abi: farmingAbi,
					functionName: 'totalStaked',
				}),
				client.readContract({
					address: contracts.farming,
					abi: farmingAbi,
					functionName: 'reservedRewards',
				}),
				client.readContract({
					address: contracts.farming,
					abi: farmingAbi,
					functionName: 'rewardsAvailableFrom',
				}),
			]),
		]);

		const lpToken = await readToken(lpTokenAddress);

		const [reserveA, reserveB] = reserves;
		const [
			stakingRewardRatePerSecond,
			stakingTotalStaked,
			stakingReservedRewards,
			stakingRewardsAvailableFrom,
		] = stakingState;
		const [
			farmingRewardRatePerSecond,
			farmingTotalStaked,
			farmingReservedRewards,
			farmingRewardsAvailableFrom,
		] = farmingState;

		res.status(200).json({
			chainId: await client.getChainId(),
			contracts,
			tokens: {
				tokenA,
				tokenB,
				rewardToken,
				lpToken,
			},
			pool: {
				address: contracts.pool,
				lpTokenAddress,
				reserveA: reserveA.toString(),
				reserveB: reserveB.toString(),
				reserveAFormatted: formatTokenAmount(reserveA, tokenA.decimals),
				reserveBFormatted: formatTokenAmount(reserveB, tokenB.decimals),
				approxTvlFormatted: (
					Number(formatTokenAmount(reserveA, tokenA.decimals)) +
					Number(formatTokenAmount(reserveB, tokenB.decimals))
				).toFixed(2),
			},
			staking: {
				address: contracts.staking,
				totalStaked: stakingTotalStaked.toString(),
				totalStakedFormatted: formatTokenAmount(
					stakingTotalStaked,
					tokenA.decimals,
				),
				rewardRatePerSecond: stakingRewardRatePerSecond.toString(),
				reservedRewards: stakingReservedRewards.toString(),
				rewardsAvailableFrom: stakingRewardsAvailableFrom.toString(),
				approxAprPercent: calculateAprPercent(
					stakingRewardRatePerSecond,
					stakingTotalStaked,
				),
			},
			farming: {
				address: contracts.farming,
				totalStaked: farmingTotalStaked.toString(),
				totalStakedFormatted: formatTokenAmount(
					farmingTotalStaked,
					lpToken.decimals,
				),
				rewardRatePerSecond: farmingRewardRatePerSecond.toString(),
				reservedRewards: farmingReservedRewards.toString(),
				rewardsAvailableFrom: farmingRewardsAvailableFrom.toString(),
				approxAprPercent: calculateAprPercent(
					farmingRewardRatePerSecond,
					farmingTotalStaked,
				),
			},
		});
	} catch (error) {
		res.status(500).json({
			error: 'Failed to load protocol overview',
			details: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

app.get('/api/account/:address/positions', async (req, res) => {
	try {
		const { address } = req.params;

		if (!isAddress(address)) {
			res.status(400).json({ error: 'Invalid address' });
			return;
		}

		const walletAddress = address as Address;
		const [tokenA, tokenB, rewardToken] = await Promise.all([
			readToken(contracts.tokenA),
			readToken(contracts.tokenB),
			readToken(contracts.rewardToken),
		]);

		const [lpTokenAddress, stakingState, farmingState] = await Promise.all([
			client.readContract({
				address: contracts.pool,
				abi: liquidityPoolAbi,
				functionName: 'lpToken',
			}),
			Promise.all([
				client.readContract({
					address: contracts.staking,
					abi: stakingAbi,
					functionName: 'stakedBalance',
					args: [walletAddress],
				}),
				client.readContract({
					address: contracts.staking,
					abi: stakingAbi,
					functionName: 'pendingRewards',
					args: [walletAddress],
				}),
			]),
			Promise.all([
				client.readContract({
					address: contracts.farming,
					abi: farmingAbi,
					functionName: 'stakedBalance',
					args: [walletAddress],
				}),
				client.readContract({
					address: contracts.farming,
					abi: farmingAbi,
					functionName: 'pendingRewards',
					args: [walletAddress],
				}),
			]),
		]);

		const lpToken = await readToken(lpTokenAddress);
		const [tokenABalance, tokenBBalance, rewardTokenBalance, lpTokenBalance] =
			await Promise.all([
				client.readContract({
					address: contracts.tokenA,
					abi: erc20Abi,
					functionName: 'balanceOf',
					args: [walletAddress],
				}),
				client.readContract({
					address: contracts.tokenB,
					abi: erc20Abi,
					functionName: 'balanceOf',
					args: [walletAddress],
				}),
				client.readContract({
					address: contracts.rewardToken,
					abi: erc20Abi,
					functionName: 'balanceOf',
					args: [walletAddress],
				}),
				client.readContract({
					address: lpTokenAddress,
					abi: erc20Abi,
					functionName: 'balanceOf',
					args: [walletAddress],
				}),
			]);

		const [stakingPosition, farmingPosition] = [stakingState, farmingState];

		res.status(200).json({
			address: walletAddress,
			wallet: {
				tokenA: {
					raw: tokenABalance.toString(),
					formatted: formatTokenAmount(tokenABalance, tokenA.decimals),
				},
				tokenB: {
					raw: tokenBBalance.toString(),
					formatted: formatTokenAmount(tokenBBalance, tokenB.decimals),
				},
				rewardToken: {
					raw: rewardTokenBalance.toString(),
					formatted: formatTokenAmount(rewardTokenBalance, rewardToken.decimals),
				},
				lpToken: {
					raw: lpTokenBalance.toString(),
					formatted: formatTokenAmount(lpTokenBalance, lpToken.decimals),
				},
			},
			staking: {
				staked: stakingPosition[0].toString(),
				stakedFormatted: formatTokenAmount(stakingPosition[0], tokenA.decimals),
				pendingRewards: stakingPosition[1].toString(),
				pendingRewardsFormatted: formatTokenAmount(
					stakingPosition[1],
					tokenA.decimals,
				),
			},
			farming: {
				staked: farmingPosition[0].toString(),
				stakedFormatted: formatTokenAmount(farmingPosition[0], lpToken.decimals),
				pendingRewards: farmingPosition[1].toString(),
				pendingRewardsFormatted: formatTokenAmount(
					farmingPosition[1],
					rewardToken.decimals,
				),
			},
		});
	} catch (error) {
		res.status(500).json({
			error: 'Failed to load account positions',
			details: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

app.listen(port, () => {
	console.log(`Backend listening on http://localhost:${port}`);
});
