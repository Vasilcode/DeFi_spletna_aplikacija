# Backend

Read-only podporni sloj za frontend in diplomsko dokumentacijo.

Trenutni endpointi:

- `GET /api/health`
- `GET /api/protocol/overview`
- `GET /api/account/:address/positions`

Namen:

- analitika in agregirani prikazi
- TVL / APR / reward metrika
- uporabniske read-only pozicije

Backend:

- ne podpisuje transakcij
- ne hrani zasebnih kljucev
- ni source of truth za financno stanje
