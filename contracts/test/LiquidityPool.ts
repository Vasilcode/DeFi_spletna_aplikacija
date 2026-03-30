import { expect } from 'chai';
import { network } from 'hardhat';

describe('LiquidityPool', function () {
	async function deployFixture() {
		const { ethers } = await network.connect();
		const [owner, user] = await ethers.getSigners();

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

		return { ethers, owner, user, tokenA, tokenB, pool, initialSupply };
	}

	it('should add initial liquidity and mint LP tokens', async function () {
		const { ethers, owner, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		const approveATx = await tokenA.approve(await pool.getAddress(), amountA);
		await approveATx.wait();

		const approveBTx = await tokenB.approve(await pool.getAddress(), amountB);
		await approveBTx.wait();

		const addLiquidityTx = await pool.addLiquidity(
			amountA,
			amountB,
			amountA,
			amountB,
		);
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

	it('should honor liquidity minimums when desired amounts are unbalanced', async function () {
		const { ethers, owner, user, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const desiredAmountA = ethers.parseUnits('500', 18);
		const desiredAmountB = ethers.parseUnits('300', 18);
		const expectedAmountA = ethers.parseUnits('300', 18);
		const expectedAmountB = ethers.parseUnits('300', 18);

		await (await tokenA.transfer(user.address, desiredAmountA)).wait();
		await (await tokenB.transfer(user.address, desiredAmountB)).wait();
		await (
			await tokenA.connect(user).approve(await pool.getAddress(), desiredAmountA)
		).wait();
		await (
			await tokenB.connect(user).approve(await pool.getAddress(), desiredAmountB)
		).wait();
		await (
			await pool
				.connect(user)
				.addLiquidity(desiredAmountA, desiredAmountB, expectedAmountA, expectedAmountB)
		).wait();

		const [reserveA, reserveB] = await pool.getReserves();
		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		expect(reserveA).to.equal(amountA + expectedAmountA);
		expect(reserveB).to.equal(amountB + expectedAmountB);
		expect(await lpToken.balanceOf(owner.address)).to.equal(
			ethers.parseUnits('1000', 18),
		);
		expect(await lpToken.balanceOf(user.address)).to.equal(expectedAmountA);
	});

	it('should revert when liquidity minimums cannot be met', async function () {
		const { ethers, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const wrongAmountA = ethers.parseUnits('500', 18);
		const wrongAmountB = ethers.parseUnits('300', 18);

		await (await tokenA.approve(await pool.getAddress(), wrongAmountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), wrongAmountB)).wait();

		await expect(
			pool.addLiquidity(
				wrongAmountA,
				wrongAmountB,
				wrongAmountA,
				wrongAmountB,
			),
		).to.be.revertedWithCustomError(pool, 'InsufficientAAmount');
	});

	it('should remove liquidity and return both tokens proportionally', async function () {
		const { ethers, owner, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const liquidityToRemove = ethers.parseUnits('500', 18);

		const ownerBalanceABefore = await tokenA.balanceOf(owner.address);
		const ownerBalanceBBefore = await tokenB.balanceOf(owner.address);

		const removeTx = await pool.removeLiquidity(liquidityToRemove);
		await removeTx.wait();

		const [reserveA, reserveB] = await pool.getReserves();

		expect(reserveA).to.equal(ethers.parseUnits('500', 18));
		expect(reserveB).to.equal(ethers.parseUnits('500', 18));

		expect(await lpToken.balanceOf(owner.address)).to.equal(
			ethers.parseUnits('500', 18),
		);

		expect(await tokenA.balanceOf(owner.address)).to.equal(
			ownerBalanceABefore + liquidityToRemove,
		);

		expect(await tokenB.balanceOf(owner.address)).to.equal(
			ownerBalanceBBefore + liquidityToRemove,
		);
	});

	it('should revert when trying to remove zero liquidity', async function () {
		const { ethers, pool } = await deployFixture();

		await expect(
			pool.removeLiquidity(ethers.parseUnits('0', 18)),
		).to.be.revertedWithCustomError(pool, 'InvalidAmount');
	});

	it('should revert when trying to remove more liquidity than owned', async function () {
		const { ethers, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const tooMuchLiquidity = ethers.parseUnits('1500', 18);

		await expect(pool.removeLiquidity(tooMuchLiquidity)).to.be.rejected;
	});

	it('should swap tokenA for tokenB and update reserves', async function () {
		const { ethers, owner, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const swapAmountIn = ethers.parseUnits('100', 18);

		await (await tokenA.approve(await pool.getAddress(), swapAmountIn)).wait();

		const ownerTokenBefore = await tokenB.balanceOf(owner.address);

		const expectedAmountOut =
			(swapAmountIn * amountB) / (amountA + swapAmountIn);

		const swapTx = await pool.swap(
			await tokenA.getAddress(),
			swapAmountIn,
			expectedAmountOut,
		);
		await swapTx.wait();

		const [reserveA, reserveB] = await pool.getReserves();

		expect(await tokenB.balanceOf(owner.address)).to.equal(
			ownerTokenBefore + expectedAmountOut,
		);

		expect(reserveA).to.equal(amountA + swapAmountIn);
		expect(reserveB).to.equal(amountB - expectedAmountOut);
	});

	it('should revert swap when minAmountOut is too high', async function () {
		const { ethers, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const swapAmountIn = ethers.parseUnits('100', 18);

		await (await tokenA.approve(await pool.getAddress(), swapAmountIn)).wait();

		const unrealisticMinAmountOut = ethers.parseUnits('200', 18);

		await expect(
			pool.swap(
				await tokenA.getAddress(),
				swapAmountIn,
				unrealisticMinAmountOut,
			),
		).to.be.revertedWithCustomError(pool, 'InsufficientOutputAmount');
	});

	it('should revert swap when tokenIn is invalid', async function () {
		const { ethers, tokenA, tokenB, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const fakeTokenAddress = '0x0000000000000000000000000000000000000001';
		const swapAmountIn = ethers.parseUnits('100', 18);

		await expect(
			pool.swap(fakeTokenAddress, swapAmountIn, 1),
		).to.be.revertedWithCustomError(pool, 'InvalidToken');
	});

	it('should swap tokenB for tokenA and update reserves', async function () {
		const { ethers, tokenA, tokenB, owner, pool } = await deployFixture();

		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		const swapAmountIn = ethers.parseUnits('100', 18);

		await (await tokenB.approve(await pool.getAddress(), swapAmountIn)).wait();

		const ownerTokenABefore = await tokenA.balanceOf(owner.address);

		const expectedAmountOut =
			(swapAmountIn * amountA) / (amountB + swapAmountIn);

		const swapTx = await pool.swap(
			await tokenB.getAddress(),
			swapAmountIn,
			expectedAmountOut,
		);
		await swapTx.wait();

		const [reserveA, reserveB] = await pool.getReserves();

		expect(await tokenA.balanceOf(owner.address)).to.equal(
			ownerTokenABefore + expectedAmountOut,
		);

		expect(reserveA).to.equal(amountA - expectedAmountOut);
		expect(reserveB).to.equal(amountB + swapAmountIn);
	});
});
