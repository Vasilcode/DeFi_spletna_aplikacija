import { expect } from 'chai';
import { network } from 'hardhat';

describe('StakingContract', function () {
	async function deployFixture() {
		const { ethers } = await network.connect();
		const [owner] = await ethers.getSigners();

		const initialSupply = ethers.parseUnits('1000000', 18);
		const rewardRatePerSecond = ethers.parseUnits('0.001', 18);

		const token = await ethers.deployContract('ERC20Token', [
			'Stake Token',
			'STK',
			initialSupply,
		]);
		await token.waitForDeployment();

		const staking = await ethers.deployContract('StakingContract', [
			await token.getAddress(),
			rewardRatePerSecond,
		]);
		await staking.waitForDeployment();

		return { ethers, owner, token, staking, rewardRatePerSecond };
	}

	it('should stake token and update balances', async function () {
		const { ethers, owner, token, staking } = await deployFixture();

		const stakeAmount = ethers.parseUnits('1000', 18);

		await (await token.approve(await staking.getAddress(), stakeAmount)).wait();
		await (await staking.stake(stakeAmount)).wait();

		expect(await staking.stakedBalance(owner.address)).to.equal(stakeAmount);
		expect(await staking.totalStaked()).to.equal(stakeAmount);
	});

	it('should unstake tokens and reduce balances', async function () {
		const { ethers, owner, token, staking } = await deployFixture();

		const stakeAmount = ethers.parseUnits('1000', 18);
		const unstakeAmount = ethers.parseUnits('400', 18);

		await (await token.approve(await staking.getAddress(), stakeAmount)).wait();
		await (await staking.stake(stakeAmount)).wait();

		const ownerBalanceBefore = await token.balanceOf(owner.address);

		await (await staking.unstake(unstakeAmount)).wait();

		expect(await staking.stakedBalance(owner.address)).to.equal(
			stakeAmount - unstakeAmount,
		);
		expect(await staking.totalStaked()).to.equal(stakeAmount - unstakeAmount);
		expect(await token.balanceOf(owner.address)).to.equal(
			ownerBalanceBefore + unstakeAmount,
		);
	});

	it('should accumulate rewards over time and allow claiming', async function () {
		const { ethers, owner, token, staking } = await deployFixture();

		const stakeAmount = ethers.parseUnits('1000', 18);
		const rewardFunding = ethers.parseUnits('10000', 18);

		await (await token.approve(await staking.getAddress(), rewardFunding)).wait();
		await (await staking.fundRewards(rewardFunding)).wait();

		await (await token.approve(await staking.getAddress(), stakeAmount)).wait();
		await (await staking.stake(stakeAmount)).wait();

		await ethers.provider.send('evm_increaseTime', [100]);
		await ethers.provider.send('evm_mine', []);

		const ownerBalanceBefore = await token.balanceOf(owner.address);

		await (await staking.claimRewards()).wait();

		const ownerBalanceAfter = await token.balanceOf(owner.address);

		expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
		expect(await staking.pendingRewards(owner.address)).to.equal(0n);
	});

	it('should not accrue rewards for time before rewards are funded', async function () {
		const { ethers, owner, token, staking } = await deployFixture();

		const stakeAmount = ethers.parseUnits('1000', 18);
		const rewardFunding = ethers.parseUnits('10000', 18);

		await (await token.approve(await staking.getAddress(), stakeAmount)).wait();
		await (await staking.stake(stakeAmount)).wait();

		await ethers.provider.send('evm_increaseTime', [100]);
		await ethers.provider.send('evm_mine', []);

		await (await token.approve(await staking.getAddress(), rewardFunding)).wait();
		await (await staking.fundRewards(rewardFunding)).wait();

		await ethers.provider.send('evm_increaseTime', [10]);
		await ethers.provider.send('evm_mine', []);

		const ownerBalanceBefore = await token.balanceOf(owner.address);

		await (await staking.claimRewards()).wait();

		const claimedReward = (await token.balanceOf(owner.address)) - ownerBalanceBefore;

		expect(claimedReward).to.be.gt(0n);
		expect(claimedReward).to.be.lt(ethers.parseUnits('20', 18));
	});

	it('should revert when trying to stake zero tokens', async function () {
		const { ethers, staking } = await deployFixture();

		await expect(
			staking.stake(ethers.parseUnits('0', 18)),
		).to.be.revertedWithCustomError(staking, 'InvalidAmount');
	});

	it('should revert when trying to unstake more than staked', async function () {
		const { ethers, token, staking } = await deployFixture();

		const stakeAmount = ethers.parseUnits('1000', 18);
		const tooMuchToUnstake = ethers.parseUnits('1500', 18);

		await (await token.approve(await staking.getAddress(), stakeAmount)).wait();
		await (await staking.stake(stakeAmount)).wait();

		await expect(
			staking.unstake(tooMuchToUnstake),
		).to.be.revertedWithCustomError(staking, 'InsufficientStakedBalance');
	});

	it('should revert when trying to claim rewards with no rewards accrued', async function () {
		const { staking } = await deployFixture();

		await expect(staking.claimRewards()).to.be.revertedWithCustomError(
			staking,
			'NoRewardsToClaim',
		);
	});

	it('should cap rewards to the funded reward pool', async function () {
		const { ethers, owner, token, staking } = await deployFixture();

		const stakeAmount = ethers.parseUnits('1000', 18);
		const rewardFunding = ethers.parseUnits('10', 18);

		await (await token.approve(await staking.getAddress(), rewardFunding)).wait();
		await (await staking.fundRewards(rewardFunding)).wait();

		await (await token.approve(await staking.getAddress(), stakeAmount)).wait();
		await (await staking.stake(stakeAmount)).wait();

		await ethers.provider.send('evm_increaseTime', [100]);
		await ethers.provider.send('evm_mine', []);

		const ownerBalanceBefore = await token.balanceOf(owner.address);

		await (await staking.claimRewards()).wait();

		const claimedReward = (await token.balanceOf(owner.address)) - ownerBalanceBefore;

		expect(claimedReward).to.equal(rewardFunding);
		expect(await staking.pendingRewards(owner.address)).to.equal(0n);
		expect(await staking.reservedRewards()).to.equal(0n);
	});
});
