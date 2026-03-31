# Frontend Smoke Checklist

Okolje:

- local Hardhat RPC: `31337`
- frontend: `Vite + React + TypeScript`
- wallet: injected MetaMask

Avtomatizirano preverjeno:

- `App` disconnected state
- `App` wrong-network state
- `App` dashboard state
- `SwapSection` approval vs action
- `SwapSection` quote/min received render
- `AddLiquiditySection` LP preview + approval render

Dokaz:

- [App.test.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/App.test.tsx)
- [SwapSection.test.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/SwapSection.test.tsx)
- [AddLiquiditySection.test.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/AddLiquiditySection.test.tsx)

Ročni smoke flowi v lokalnem razvoju:

- wallet connect
- wrong network switch
- staking approve
- staking stake
- staking claim rewards
- staking unstake
- add liquidity
- swap
- remove liquidity
- yield farming approve LP
- yield farming stake LP
- yield farming claim rewards
- yield farming unstake LP

Relevantni UI moduli:

- [App.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/App.tsx)
- [components](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components)
- [hooks](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks)
