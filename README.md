# DeFi spletna aplikacija

Prototip decentralizirane financne spletne aplikacije za diplomsko delo z naslovom:

`Razvoj decentralizirane finance (DeFi) spletne aplikacije`

Projekt vsebuje celoten lokalni DeFi stack:
- ERC-20 zeton
- DEX z likvidnostnim bazenom in LP zetonom
- staking
- yield farming
- React frontend z Web3 povezavo
- read-only backend za analitiko in agregacijo podatkov

## Glavne funkcionalnosti

- povezava z MetaMask prek `wagmi + viem`
- preverjanje pravilnega omrezja (`chainId`)
- swap med `Token A` in `Token B`
- dodajanje in odstranjevanje likvidnosti
- staking osnovnega zetona
- yield farming z LP zetoni
- backend analytics pregled:
  - approximate TVL
  - staking APR
  - farming APR

## Tehnoloski sklad

### Smart contracts
- Solidity `0.8.28`
- Hardhat
- OpenZeppelin
- `ethers.js` v testnem in deployment sloju

### Frontend
- React
- TypeScript
- Vite
- `wagmi`
- `viem`
- `@tanstack/react-query`

### Backend
- Node.js
- TypeScript
- Express
- `viem` public client za read-only blockchain klice

## Struktura repozitorija

- `contracts/`
  - pametne pogodbe
  - Hardhat konfiguracija
  - deployment skripte
  - unit testi
- `frontend/`
  - React + TypeScript uporabniski vmesnik
  - wallet connect
  - DEX, staking in farming moduli
- `backend/`
  - read-only podporni sloj za analitiko in agregacijo podatkov
- `docs/`
  - gradivo za diplomsko delo, slike, osnutki in ostala dokumentacija

## Klucne pogodbe

- `ERC20Token.sol`
- `LPToken.sol`
- `LiquidityPool.sol`
- `StakingContract.sol`
- `YieldFarming.sol`

## Zahteve za lokalni zagon

- Node.js `22.10.0+` LTS je priporocen
- `npm`
- MetaMask

Opomba:
- Hardhat trenutno opozarja, ce uporabljas nepodprto verzijo Node.js
- projekt deluje lokalno na `Hardhat` omrezju z `chainId 31337`

## Namestitev

Namesti odvisnosti v vseh treh delih projekta:

```powershell
cd contracts
npm install

cd ..\\frontend
npm install

cd ..\\backend
npm install
```

## Okoljske spremenljivke

Ustvari root `.env` datoteko iz vzorca:

```powershell
Copy-Item .env.example .env
```

Datoteka `.env` se uporablja tako v frontendu kot tudi v backendu.

Pomembne spremenljivke:
- `VITE_APP_CHAIN_ID`
- `VITE_APP_RPC_URL`
- `VITE_APP_BACKEND_URL`
- `VITE_APP_TOKEN_ADDRESS`
- `VITE_APP_TOKEN_B_ADDRESS`
- `VITE_APP_POOL_ADDRESS`
- `VITE_APP_STAKING_ADDRESS`
- `VITE_APP_FARMING_ADDRESS`
- `VITE_APP_REWARD_TOKEN_ADDRESS`

## Lokalni demo zagon

Za polni lokalni demo morajo teci stiri stvari:
- Hardhat node
- deploy skripta
- backend
- frontend

### 1. Zagon lokalnega blockchaina

```powershell
cd contracts
npx hardhat node --chain-id 31337
```

Pusti ta terminal odprt.

### 2. Deploy lokalnega protokola

V drugem terminalu:

```powershell
cd contracts
npx hardhat run scripts/deploy-local-stack.ts --network localhost
```

Skripta izpise nove naslove pogodb. Ce se razlikujejo od vrednosti v `.env`, jih prekopiraj v root `.env`.

Pomembno:
- ce restartas `hardhat node`, se lokalna veriga resetira
- po resetu moras ponovno:
  - pognati deploy skripto
  - osveziti naslove v `.env`
  - restartati backend in frontend

### 3. Zagon backend read layerja

```powershell
cd backend
npm run dev
```

Backend privzeto tece na:

```text
http://localhost:3001
```

### 4. Zagon frontenda

```powershell
cd frontend
npm run dev
```

Frontend privzeto tece na:

```text
http://localhost:5173
```

## MetaMask nastavitev za lokalni demo

Dodaj custom network:
- Network name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

Nato v MetaMask uvozi enega od testnih racunov, ki jih izpise `hardhat node`.

Ko odpres aplikacijo:
- povezi MetaMask
- ce je omrezje napacno, klikni `Switch Network`

## Kaj lahko preveris v aplikaciji

### Trade
- approval za input token
- swap med `Token A` in `Token B`
- expected output
- minimum received
- opozorilo pri visoki slippage toleranci

### Liquidity
- approval za oba tokena
- add liquidity
- remove liquidity
- LP preview
- projected pool share

### Rewards
- staking osnovnega zetona
- unstake
- claim rewards
- yield farming z LP zetoni
- unstake LP
- claim farming rewards

### Overview
- Wallet status
- Market snapshot
- Analytics snapshot iz backend layerja

## Testiranje

### Smart contract testi

```powershell
cd contracts
npm test
```

### Frontend testi

```powershell
cd frontend
npm test
```

### Frontend build

```powershell
cd frontend
npm run build
```

### Frontend lint

```powershell
cd frontend
npm run lint
```

### Backend build

```powershell
cd backend
npm run build
```

## Backend endpointi

Backend je read-only sloj in ne podpisuje transakcij.

Glavni endpointi:
- `GET /api/health`
- `GET /api/protocol/overview`
- `GET /api/account/:address/positions`

Backend pripravlja podatke za:
- TVL pregled
- APR pregled
- wallet pozicije
- staking pozicije
- farming pozicije

## Pomembne opombe

- blockchain ostaja glavni vir resnice za financno stanje
- backend ne upravlja zasebnih kljucev
- frontend uporablja `wagmi + viem`
- Hardhat testni in deployment sloj uporablja `ethers.js`
- lokalni naslovni prostor pogodb ni trajen med restarti `hardhat node`

## Priporocen lokalni vrstni red zagona

1. `contracts`: `npx hardhat node --chain-id 31337`
2. `contracts`: `npx hardhat run scripts/deploy-local-stack.ts --network localhost`
3. uskladi `.env`
4. `backend`: `npm run dev`
5. `frontend`: `npm run dev`
6. povezi MetaMask

## Namen repozitorija

Ta repozitorij predstavlja delujoc diplomski prototip, namenjen:
- predstavitvi implementacije DeFi modulov
- lokalnemu testiranju prek Hardhat omrezja
- pregledu kode, testov in arhitekture

