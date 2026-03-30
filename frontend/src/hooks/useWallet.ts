import {
	useAccount,
	useChainId,
	useConnect,
	useDisconnect,
	useSwitchChain,
} from 'wagmi';
import { appChain } from '../lib/wagmi';

export function useWallet() {
	const { address, isConnected } = useAccount();
	const { connect, connectors, isPending } = useConnect();
	const { disconnect } = useDisconnect();
	const { switchChain } = useSwitchChain();
	const chainId = useChainId();

	const expectedChainId = appChain.id;
	const isCorrectChain = chainId === expectedChainId;

	return {
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
	};
}
