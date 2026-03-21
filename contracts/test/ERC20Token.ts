import { expect } from 'chai';
import { network } from 'hardhat';

describe('ERC20Token', function () {
	async function deployToken() {
		const { ethers } = await network.connect();
		const [owner, spender, recipient, user] = await ethers.getSigners();

		const initialSupply = ethers.parseUnits('1000000', 18);

		const token = await ethers.deployContract('ERC20Token', [
			'Demo Token',
			'DMT',
			initialSupply,
		]);

		await token.waitForDeployment();

		return { ethers, token, owner, spender, recipient, user, initialSupply };
	}

	it('should assign the initial supply to the deployer', async function () {
		const { token, owner, initialSupply } = await deployToken();

		expect(await token.name()).to.equal('Demo Token');
		expect(await token.symbol()).to.equal('DMT');
		expect(await token.totalSupply()).to.equal(initialSupply);
		expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
	});

	it('should transfer tokens between accounts', async function () {
		const { token, owner, user, initialSupply, ethers } = await deployToken();

		const transferAmount = ethers.parseUnits('100', 18);
		const tx = await token.transfer(user.address, transferAmount);
		await tx.wait();

		expect(await token.balanceOf(user.address)).to.equal(transferAmount);
		expect(await token.balanceOf(owner.address)).to.equal(
			initialSupply - transferAmount,
		);
	});

	it('should approve allowance and allow transferFrom by spender', async function () {
		const { token, owner, spender, recipient, ethers } = await deployToken();

		const approvalAmount = ethers.parseUnits('500', 18);
		const transferAmount = ethers.parseUnits('200', 18);

		const approveTx = await token.approve(spender.address, approvalAmount);
		await approveTx.wait();

		expect(await token.allowance(owner.address, spender.address)).to.equal(
			approvalAmount,
		);

		const transferFromTx = await token
			.connect(spender)
			.transferFrom(owner.address, recipient.address, transferAmount);
		await transferFromTx.wait();

		expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
		expect(await token.allowance(owner.address, spender.address)).to.equal(
			approvalAmount - transferAmount,
		);
	});
});
