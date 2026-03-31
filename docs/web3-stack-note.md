# Web3 Stack Note

## Povzetek

Projekt ima implementirano polno Web3 integracijo med frontendom, denarnico in Ethereum omrezjem. Pri tem sta uporabljena dva sloja:

- `wagmi + viem` v frontend aplikaciji
- `ethers` znotraj Hardhat razvojnega, testnega in deployment okolja

To ni funkcionalna vrzel, ampak razdelitev odgovornosti med uporabniski in razvojni sloj.

## Dejanska uporaba v projektu

### Frontend

Frontend uporablja:

- `wagmi` za React Web3 hooke, wallet povezavo, chain check, read/write klice in cakanje na potrditev transakcij
- `viem` za ABI delo, chain konfiguracijo, parse/format zneskov in nizkonivojske Ethereum odjemalce

Relevantne datoteke:

- [wagmi.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/lib/wagmi.ts)
- [useWallet.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useWallet.ts)
- [useStaking.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useStaking.ts)
- [useLiquidity.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useLiquidity.ts)
- [useSwap.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useSwap.ts)
- [useYieldFarming.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/frontend/src/hooks/useYieldFarming.ts)

### Hardhat / pogodbeni sloj

Projekt uporablja tudi `ethers`, vendar tam, kjer je to najbolj smiselno:

- deployment skripte
- unit testi pametnih pogodb
- Hardhat plugin ekosistem

Relevantne datoteke:

- [contracts/package.json](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/package.json)
- [deploy-local-stack.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/scripts/deploy-local-stack.ts)
- [StakingContract.ts](/C:/Users/Vasilijev/Desktop/DeFi_spletna_aplikacija/contracts/test/StakingContract.ts)

## Zakaj je ta pristop korekten

Ta implementacija se funkcionalno ujema z zahtevo po Web3 integraciji, ker projekt dejansko podpira:

- povezavo z denarnico
- preverjanje omrezja
- branje podatkov iz pametnih pogodb
- posiljanje transakcij
- cakanje na receipt
- osvezitev podatkov po transakcijah

Razlika je samo v tem, da frontend namesto neposredne uporabe `ethers.js` uporablja modernejso React-usmerjeno kombinacijo `wagmi + viem`.

## Predlagano besedilo za diplomo

V implementaciji frontenda je bila za Web3 integracijo uporabljena kombinacija knjiznic `wagmi` in `viem`, ki omogocata povezavo med uporabniskim vmesnikom, denarnico MetaMask in Ethereum omrezjem. Knjiznica `ethers` je bila uporabljena v razvojnem in testnem okolju pametnih pogodb znotraj ekosistema Hardhat, predvsem za deployment skripte in avtomatizirane teste. Izbira `wagmi + viem` v frontendu tako predstavlja implementacijsko odlocitev na ravni odjemalske arhitekture in ne pomeni odsotnosti Web3 integracije.

## Kratka formulacija za tabelo zahtev

Web3 integracija: izpolnjena. Frontend uporablja `wagmi + viem`, medtem ko je `ethers` uporabljen v Hardhat testnem in deployment sloju.
