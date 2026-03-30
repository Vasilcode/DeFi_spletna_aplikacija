import { expect } from 'chai';
import { network } from 'hardhat';

describe('YieldFarming', function () {
	async function deployFixture() {
		const { ethers } = await network.connect();
		const [owner] = await ethers.getSigners();

		const initialSupply = ethers.parseUnits('1000000', 18);
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

		const farming = await ethers.deployContract('YieldFarming', [
			await pool.lpToken(),
			await rewardToken.getAddress(),
			rewardRatePerSecond,
		]);
		await farming.waitForDeployment();

		return {
			ethers,
			owner,
			tokenA,
			tokenB,
			rewardToken,
			pool,
			farming,
			rewardRatePerSecond,
		};
	}

	type Fixture = Awaited<ReturnType<typeof deployFixture>>;
	type LiquidityDependencies = Pick<Fixture, 'tokenA' | 'tokenB' | 'pool' | 'ethers'>;

	async function provideLiquidity({
		tokenA,
		tokenB,
		pool,
		ethers,
	}: LiquidityDependencies) {
		const amountA = ethers.parseUnits('1000', 18);
		const amountB = ethers.parseUnits('1000', 18);

		await (await tokenA.approve(await pool.getAddress(), amountA)).wait();
		await (await tokenB.approve(await pool.getAddress(), amountB)).wait();
		await (await pool.addLiquidity(amountA, amountB, amountA, amountB)).wait();

		return { amountA, amountB };
	}

	it('should stake LP tokens and update balances', async function () {
		const { ethers, owner, tokenA, tokenB, pool, farming } =
			await deployFixture();

		await provideLiquidity({ tokenA, tokenB, pool, ethers });

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const lpBalance = await lpToken.balanceOf(owner.address);

		await (await lpToken.approve(await farming.getAddress(), lpBalance)).wait();
		await (await farming.stake(lpBalance)).wait();

		expect(await farming.stakedBalance(owner.address)).to.equal(lpBalance);
		expect(await farming.totalStaked()).to.equal(lpBalance);
	});

	it('should unstake LP tokens and reduce balances', async function () {
		const { ethers, owner, tokenA, tokenB, pool, farming } =
			await deployFixture();

		await provideLiquidity({ tokenA, tokenB, pool, ethers });

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const lpBalance = await lpToken.balanceOf(owner.address);
		const unstakeAmount = lpBalance / 2n;

		await (await lpToken.approve(await farming.getAddress(), lpBalance)).wait();
		await (await farming.stake(lpBalance)).wait();

		const ownerLpBefore = await lpToken.balanceOf(owner.address);

		await (await farming.unstake(unstakeAmount)).wait();

		expect(await farming.stakedBalance(owner.address)).to.equal(
			lpBalance - unstakeAmount,
		);
		expect(await farming.totalStaked()).to.equal(lpBalance - unstakeAmount);
		expect(await lpToken.balanceOf(owner.address)).to.equal(
			ownerLpBefore + unstakeAmount,
		);
	});

	it('should accumulate rewards over time and allow claiming', async function () {
		const { ethers, owner, tokenA, tokenB, rewardToken, pool, farming } =
			await deployFixture();

		await provideLiquidity({ tokenA, tokenB, pool, ethers });

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const lpBalance = await lpToken.balanceOf(owner.address);
		const rewardFunding = ethers.parseUnits('10000', 18);

		await (
			await rewardToken.approve(await farming.getAddress(), rewardFunding)
		).wait();
		await (await farming.fundRewards(rewardFunding)).wait();

		await (await lpToken.approve(await farming.getAddress(), lpBalance)).wait();
		await (await farming.stake(lpBalance)).wait();

		await ethers.provider.send('evm_increaseTime', [100]);
		await ethers.provider.send('evm_mine', []);

		const ownerRewardBefore = await rewardToken.balanceOf(owner.address);

		await (await farming.claimRewards()).wait();

		const ownerRewardAfter = await rewardToken.balanceOf(owner.address);

		expect(ownerRewardAfter).to.be.gt(ownerRewardBefore);
		expect(await farming.pendingRewards(owner.address)).to.equal(0n);
	});

	it('should not accrue rewards for time before rewards are funded', async function () {
		const { ethers, owner, tokenA, tokenB, rewardToken, pool, farming } =
			await deployFixture();

		await provideLiquidity({ tokenA, tokenB, pool, ethers });

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const lpBalance = await lpToken.balanceOf(owner.address);
		const rewardFunding = ethers.parseUnits('10000', 18);

		await (await lpToken.approve(await farming.getAddress(), lpBalance)).wait();
		await (await farming.stake(lpBalance)).wait();

		await ethers.provider.send('evm_increaseTime', [100]);
		await ethers.provider.send('evm_mine', []);

		await (
			await rewardToken.approve(await farming.getAddress(), rewardFunding)
		).wait();
		await (await farming.fundRewards(rewardFunding)).wait();

		await ethers.provider.send('evm_increaseTime', [10]);
		await ethers.provider.send('evm_mine', []);

		const ownerRewardBefore = await rewardToken.balanceOf(owner.address);

		await (await farming.claimRewards()).wait();

		const claimedReward =
			(await rewardToken.balanceOf(owner.address)) - ownerRewardBefore;

		expect(claimedReward).to.be.gt(0n);
		expect(claimedReward).to.be.lt(ethers.parseUnits('20', 18));
	});

	it('should revert when trying to stake zero LP tokens', async function () {
		const { ethers, farming } = await deployFixture();

		await expect(
			farming.stake(ethers.parseUnits('0', 18)),
		).to.be.revertedWithCustomError(farming, 'InvalidAmount');
	});

	it('should revert when trying to unstake more LP tokens than staked', async function () {
		const { ethers, owner, tokenA, tokenB, pool, farming } =
			await deployFixture();

		await provideLiquidity({ tokenA, tokenB, pool, ethers });

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const lpBalance = await lpToken.balanceOf(owner.address);
		const tooMuchToUnstake = lpBalance + ethers.parseUnits('1', 18);

		await (await lpToken.approve(await farming.getAddress(), lpBalance)).wait();
		await (await farming.stake(lpBalance)).wait();

		await expect(
			farming.unstake(tooMuchToUnstake),
		).to.be.revertedWithCustomError(farming, 'InsufficientStakedBalance');
	});

	it('should revert when trying to claim rewards with no rewards accrued', async function () {
		const { farming } = await deployFixture();

		await expect(farming.claimRewards()).to.be.revertedWithCustomError(
			farming,
			'NoRewardsToClaim',
		);
	});

	it('should cap rewards to the funded reward pool', async function () {
		const { ethers, owner, tokenA, tokenB, rewardToken, pool, farming } =
			await deployFixture();

		await provideLiquidity({ tokenA, tokenB, pool, ethers });

		const lpTokenAddress = await pool.lpToken();
		const lpToken = await ethers.getContractAt('LPToken', lpTokenAddress);

		const lpBalance = await lpToken.balanceOf(owner.address);
		const rewardFunding = ethers.parseUnits('1', 18);

		await (
			await rewardToken.approve(await farming.getAddress(), rewardFunding)
		).wait();
		await (await farming.fundRewards(rewardFunding)).wait();

		await (await lpToken.approve(await farming.getAddress(), lpBalance)).wait();
		await (await farming.stake(lpBalance)).wait();

		await ethers.provider.send('evm_increaseTime', [100]);
		await ethers.provider.send('evm_mine', []);

		const ownerRewardBefore = await rewardToken.balanceOf(owner.address);

		await (await farming.claimRewards()).wait();

		const claimedReward =
			(await rewardToken.balanceOf(owner.address)) - ownerRewardBefore;

		expect(claimedReward).to.equal(rewardFunding);
		expect(await farming.pendingRewards(owner.address)).to.equal(0n);
		expect(await farming.reservedRewards()).to.equal(0n);
	});
});
