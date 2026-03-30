import { useState } from 'react';
import './App.css';
import { useContractsData } from './hooks/useContractData';
import { useStaking } from './hooks/useStaking';
import { useWallet } from './hooks/useWallet';

function App() {
	const {
		address,
		chainId,
		expectedChainId,
		isCorrectChain,
		isConnected,
		connect,
		connectors,
		isPending,
		disconnect,
		switchChain,
	} = useWallet();

	const { tokenName, tokenSymbol, totalSupply, reserveA, reserveB } =
		useContractsData();

	const [stakeAmount, setStakeAmount] = useState('');

	const {
		isAmountValid,
		tokenBalanceFormatted,
		allowanceFormatted,
		stakedBalanceFormatted,
		needsApproval,
		approve,
		stake,
		isApprovePending,
		isApproveConfirming,
		isStakePending,
		isStakeConfirming,
	} = useStaking(stakeAmount);

	return (
		<main>
			<h1>DeFi App</h1>
			<p>Wallet + chain guard osnova</p>

			{!isConnected ? (
				<section>
					{connectors.map((connector) => (
						<button
							key={connector.uid}
							onClick={() => connect({ connector })}
							disabled={isPending}
						>
							Connect {connector.name}
						</button>
					))}
				</section>
			) : !isCorrectChain ? (
				<section>
					<p>Connected: {address}</p>
					<p>Current chain: {chainId}</p>
					<p>Expected chain: {expectedChainId}</p>
					<button onClick={() => switchChain({ chainId: expectedChainId })}>
						Switch Network
					</button>
					<button onClick={() => disconnect()}>Disconnect</button>
				</section>
			) : (
				<section>
					<p>Connected: {address}</p>
					<p>Chain ID: {chainId}</p>
					<p>Wallet is ready for contract calls.</p>

					<hr />

					<h2>Contract Data</h2>
					<p>Token name: {tokenName ?? 'Loading...'}</p>
					<p>Token symbol: {tokenSymbol ?? 'Loading...'}</p>
					<p>
						Total supply:{' '}
						{totalSupply !== undefined ? totalSupply.toString() : 'Loading...'}
					</p>
					<p>
						Reserve A:{' '}
						{reserveA !== undefined ? reserveA.toString() : 'Loading...'}
					</p>
					<p>
						Reserve B:{' '}
						{reserveB !== undefined ? reserveB.toString() : 'Loading...'}
					</p>

					<hr />

					<h2>Staking</h2>
					<p>Wallet token balance: {tokenBalanceFormatted ?? 'Loading...'}</p>
					<p>Allowance to staking: {allowanceFormatted ?? 'Loading...'}</p>
					<p>Currently staked: {stakedBalanceFormatted ?? 'Loading...'}</p>

					<input
						type="text"
						value={stakeAmount}
						onChange={(event) => setStakeAmount(event.target.value)}
						placeholder="Enter amount to stake"
					/>

					{stakeAmount && !isAmountValid ? (
						<p>Invalid amount format. Use a dot for decimals.</p>
					) : null}

					{needsApproval ? (
						<button
							onClick={() => approve()}
							disabled={
								!isAmountValid || isApprovePending || isApproveConfirming
							}
						>
							{isApprovePending || isApproveConfirming
								? 'Approving...'
								: 'Approve'}
						</button>
					) : (
						<button
							onClick={() => stake()}
							disabled={!isAmountValid || isStakePending || isStakeConfirming}
						>
							{isStakePending || isStakeConfirming ? 'Staking...' : 'Stake'}
						</button>
					)}

					<button onClick={() => disconnect()}>Disconnect</button>
				</section>
			)}
		</main>
	);
}

export default App;
