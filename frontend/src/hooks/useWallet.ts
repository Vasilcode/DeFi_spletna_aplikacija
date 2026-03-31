import {
	useAccount,
	useBalance,
	useChainId,
	useConnect,
	useDisconnect,
	useSwitchChain,
} from 'wagmi';
import { appChain } from '../lib/wagmi';
import { formatUnits } from 'viem';

export function useWallet() {
	const { address, isConnected } = useAccount();
	const balanceQuery = useBalance({
		address,
		query: {
			enabled: Boolean(address),
			refetchInterval: 2000,
		},
	});
	const { connect, connectors, isPending } = useConnect();
	const { disconnect } = useDisconnect();
	const { switchChain } = useSwitchChain();
	const chainId = useChainId();

	const expectedChainId = appChain.id;
	const isCorrectChain = chainId === expectedChainId;

	return {
		address,
		nativeBalance:
			balanceQuery.data !== undefined
				? formatUnits(balanceQuery.data.value, balanceQuery.data.decimals)
				: undefined,
		nativeBalanceSymbol: balanceQuery.data?.symbol,
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
