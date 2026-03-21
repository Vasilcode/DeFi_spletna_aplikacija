import { network } from 'hardhat';

async function main() {
	const { ethers } = await network.connect();

	const initialSupply = ethers.parseUnits('1000000', 18);

	const token = await ethers.deployContract('ERC20Token', [
		'Demo Token',
		'DMT',
		initialSupply,
	]);

	await token.waitForDeployment();

	console.log('ERC20Token deployed to:', await token.getAddress());
	console.log('Initial supply:', initialSupply.toString());
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
