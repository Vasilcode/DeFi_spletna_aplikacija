import { network } from 'hardhat';

async function main() {
	const { ethers } = await network.connect();

	const initialSupply = ethers.parseUnits('1000000', 18);
	const liquidityAmount = ethers.parseUnits('1000', 18);
	const rewardFunding = ethers.parseUnits('10000', 18);
	const rewardRatePerSecond = ethers.parseUnits('0.001', 18);

	const tokenA = await ethers.deployContract('ERC20Token', [
		'Token A',
		'TKA',
		initialSupply,
	]);
	await tokenA.waitForDeployment();

	const tokenB = await ethers.deployContract('ERC20Token', [
		'Token B',
		'TKB',
		initialSupply,
	]);
	await tokenB.waitForDeployment();

	const rewardToken = await ethers.deployContract('ERC20Token', [
		'Reward Token',
		'RWD',
		initialSupply,
	]);
	await rewardToken.waitForDeployment();

	const pool = await ethers.deployContract('LiquidityPool', [
		await tokenA.getAddress(),
		await tokenB.getAddress(),
	]);
	await pool.waitForDeployment();

	const staking = await ethers.deployContract('StakingContract', [
		await tokenA.getAddress(),
		rewardRatePerSecond,
	]);
	await staking.waitForDeployment();

	const farming = await ethers.deployContract('YieldFarming', [
		await pool.lpToken(),
		await rewardToken.getAddress(),
		rewardRatePerSecond,
	]);
	await farming.waitForDeployment();

	await (await tokenA.approve(await pool.getAddress(), liquidityAmount)).wait();
	await (await tokenB.approve(await pool.getAddress(), liquidityAmount)).wait();
	await (
		await pool.addLiquidity(
			liquidityAmount,
			liquidityAmount,
			liquidityAmount,
			liquidityAmount,
		)
	).wait();

	await (
		await tokenA.approve(await staking.getAddress(), rewardFunding)
	).wait();
	await (await staking.fundRewards(rewardFunding)).wait();

	await (
		await rewardToken.approve(await farming.getAddress(), rewardFunding)
	).wait();
	await (await farming.fundRewards(rewardFunding)).wait();

	console.log(`VITE_APP_TOKEN_ADDRESS=${await tokenA.getAddress()}`);
	console.log(`VITE_APP_POOL_ADDRESS=${await pool.getAddress()}`);
	console.log(`VITE_APP_STAKING_ADDRESS=${await staking.getAddress()}`);
	console.log(`VITE_APP_FARMING_ADDRESS=${await farming.getAddress()}`);
	console.log(
		`VITE_APP_REWARD_TOKEN_ADDRESS=${await rewardToken.getAddress()}`,
	);
	console.log(`VITE_APP_TOKEN_B_ADDRESS=${await tokenB.getAddress()}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
