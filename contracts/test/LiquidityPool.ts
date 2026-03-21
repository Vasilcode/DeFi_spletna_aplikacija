import { expect } from 'chai';
import { network } from 'hardhat';

describe('LiquidityPool', function () {
	async function deployFixture() {
		const { ethers } = await network.connect();
		const [owner] = await ethers.getSigners();

		const initialSupply = ethers.parseUnits('1000000', 18);

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

		const pool = await ethers.deployContract('LiquidityPool', [
			await tokenA.getAddress(),
			await tokenB.getAddress(),
		]);
		await pool.waitForDeployment();

		return { ethers, owner, tokenA, tokenB, pool, initialSupply };
	}

	it('should add initial liquidity and mint LP tokens', async function () {
		const { ethers, owner, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		const approveATx = await tokenA.approve(await pool.getAddress(), amountA);
		await approveATx.wait();

		const approveBTx = await tokenB.approve(await pool.getAddress(), amountB);
		await approveBTx.wait();

		const addLiquidityTx = await pool.addLiquidity(amountA, amountB);
		await addLiquidityTx.wait();

		const [reserveA, reserveB] = await pool.getReserves();

		expect(reserveA).to.equal(amountA);
		expect(reserveB).to.equal(amountB);

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const expectedLiquidity = ethers.parseUnits('1000', 18);

		expect(await lpToken.balanceOf(owner.address)).to.equal(expectedLiquidity);
		expect(await lpToken.totalSupply()).to.equal(expectedLiquidity);
	});

	it('should revert when liquidity is added in the wrong ratio', async function () {
		const { ethers, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB)).wait();

		const wrongAmountA = ethers.parseUnits('500', 18);
		const wrongAmountB = ethers.parseUnits('300', 18);

		await (await tokenA.approve(await pool.getAddress(), wrongAmountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), wrongAmountB)).wait();

		await expect(
			pool.addLiquidity(wrongAmountA, wrongAmountB),
		).to.be.revertedWithCustomError(pool, 'InvalidLiquidityRatio');
	});
});
