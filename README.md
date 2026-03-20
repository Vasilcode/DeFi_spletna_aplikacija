# DeFi spletna aplikacija

Prototipna decentralizirana finančna spletna aplikacija za diplomsko delo z naslovom:

`Razvoj decentralizirane finance (DeFi) spletne aplikacije`

## Struktura projekta

- `contracts/` - pametne pogodbe, deployment skripte in Hardhat testi
- `frontend/` - React + TypeScript uporabniski vmesnik
- `backend/` - Node.js + Express + TypeScript read-only podporni sloj
- `docs/` - screenshoti, diagrami, deployment evidence in testni rezultati

## Razvojne faze

Projekt bo implementiran po fazah:

1. Priprava razvojnega okolja
2. ERC-20 zetonska pogodba
3. LiquidityPool in DEX
4. StakingContract
5. YieldFarming
6. Varnostna analiza pogodb
7. Wallet connect in Web3 osnova
8. Frontend DEX in Liquidity
9. Frontend Staking, Farming in Dashboard
10. Backend kot podporni sloj
11. Integracija in deployment
12. Priprava rezultatov za diplomsko delo

## Opomba

Backend ni nosilec poslovne logike in ne upravlja sredstev. Blockchain ostaja glavni source of truth.
