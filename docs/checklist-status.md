# Checklist Status

Status:

- `IMA` = prisotno in preverjeno v projektu
- `OPOMBA` = pojasnilo o implementacijskem pristopu brez funkcionalne vrzeli

| Sklop | Status | Dokaz | Opomba |
| --- | --- | --- | --- |
| DeFi jedro: DEX, staking, yield farming | IMA | `contracts/contracts/*.sol`, `frontend/src/components/*Section.tsx` | Prisotno v pogodbah in UI |
| Wallet connect + chain guard | IMA | [App.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/App.tsx), [useWallet.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useWallet.ts) | Povezava, disconnect, wrong network |
| Web3 integracija | IMA | [wagmi.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/lib/wagmi.ts), [deploy-local-stack.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/scripts/deploy-local-stack.ts), [StakingContract.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/test/StakingContract.ts) | Frontend uporablja `wagmi + viem`, medtem ko je `ethers` uporabljen v Hardhat testnem in deployment sloju; glej `docs/web3-stack-note.md` |
| Podporni backend sloj | IMA | [server.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/backend/src/server.ts) | Read-only analytics endpointi |
| Testno okolje | IMA | [hardhat.config.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/hardhat.config.ts), [deploy-local-stack.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/scripts/deploy-local-stack.ts) | Hardhat, local node, Sepolia config |
| ERC-20 pogodba | IMA | [ERC20Token.sol](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/contracts/ERC20Token.sol) | OpenZeppelin ERC20 |
| DEX / Liquidity pool | IMA | [LiquidityPool.sol](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/contracts/LiquidityPool.sol) | AMM, add/remove liquidity, swap, LP token |
| Staking pogodba | IMA | [StakingContract.sol](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/contracts/StakingContract.sol) | Stake, unstake, claim, reward accounting |
| Yield farming pogodba | IMA | [YieldFarming.sol](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/contracts/YieldFarming.sol) | LP stake, reward token, claim, unstake |
| Modularnost pogodb | IMA | `ERC20Token`, `LPToken`, `LiquidityPool`, `StakingContract`, `YieldFarming` | Ločeni moduli |
| Swap UX | IMA | [useSwap.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useSwap.ts), [SwapSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/SwapSection.tsx) | Expected output, min received, slippage, pool price, gas |
| Add/remove liquidity UX | IMA | [useLiquidity.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useLiquidity.ts), [useRemoveLiquidity.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useRemoveLiquidity.ts) | Approval, LP preview, pool share, remove |
| Staking UX | IMA | [useStaking.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useStaking.ts), [StakingSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/StakingSection.tsx) | Approve, stake, unstake, claim |
| Farming UX | IMA | [useYieldFarming.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useYieldFarming.ts), [YieldFarmingSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/YieldFarmingSection.tsx) | Approve LP, stake LP, unstake, claim |
| Frontend modularnost | IMA | `frontend/src/components`, `frontend/src/hooks`, `frontend/src/lib` | React + TypeScript modulna struktura |
| Approval vs action v UI | IMA | [StakingSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/StakingSection.tsx), [AddLiquiditySection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/AddLiquiditySection.tsx), [SwapSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/SwapSection.tsx) | Jasno ločeni koraki |
| Frontend opozorila | IMA | [App.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/App.tsx), [SwapSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/SwapSection.tsx) | Wrong network, invalid inputs, high slippage, tx error message |
| Backend analytics integracija v UI | IMA | [useBackendOverview.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useBackendOverview.ts), [AnalyticsSection.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/AnalyticsSection.tsx) | TVL / APR read-only kartica |
| Unit testi pogodb | IMA | `contracts/test/*.ts` | 29 passing |
| Frontend smoke testi | IMA | [App.test.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/App.test.tsx), [SwapSection.test.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/SwapSection.test.tsx), [AddLiquiditySection.test.tsx](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/components/AddLiquiditySection.test.tsx) | Vitest + RTL |
| Varnostna analiza | IMA | `slither` run + ročni review | Povzetek v `docs/test-results/security-analysis-2026-04-01.md` |
