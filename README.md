# Quantum Orb

A points game on Blast. You connect a wallet, open one free orb every day, buy
heavier orbs when you want more, and every orb pays quantum points that decide
your place on the leaderboard.

Nothing about an orb is decided by a server. You pay in one block, the outcome
comes from the hash of a block that did not exist yet when you paid, and anyone
can recompute any result from public data.

## How an orb opens

1. **Commit.** `openOrb` records the block your payment landed in and, for a
   paid orb, takes the price. Nothing is decided yet.
2. **Wait.** The contract needs a block that nobody could see at commit time.
3. **Reveal.** `revealOrb` hashes that later block's hash together with your
   address and the commit block. That seed picks the rank, then the points
   inside the rank's range.

A relayer calls `revealOrb` for you within seconds. If it is down you can call
it yourself, and once the reveal window passes without a reveal you call
`reclaimOrb` and get your payment back. Your money is never stuck in the
contract.

Ranks come from one roll in a 10 000-wide space: 20 land on rank 4, 800 on
rank 3, 2 100 on rank 2, the rest on rank 1. Those numbers are public constants
on the contract, and `/fairness` in the app recomputes a result in the browser
from the same inputs.

## Layout

| Path         | What lives there                                                              |
| ------------ | ----------------------------------------------------------------------------- |
| `contracts/` | `QuantumOrb.sol` (Solidity 0.8.24, UUPS proxy), Hardhat tests, deploy scripts |
| `backend/`   | Django 5 API, the chain indexer and the reveal relayer                        |
| `frontend/`  | Angular 22 app, NgXS state, Tailwind and the design tokens                    |
| `docs/`      | The design spec and the implementation plans it was built from                |
| `scripts/`   | `new-wallet.js`, which mints a deployer or relayer key into a `.env`          |

The contract's ABI is exported to `contracts/abi/` and both other packages read
it from there. `npm run sync-abi` in `frontend` and the read-only mount in
`docker-compose.yml` keep them from drifting.

## Running it locally

You need Node 22 or newer, Docker, and Python 3.12 if you want to run the
backend outside Docker.

**1. Start a local chain.**

```bash
cd contracts
npm install
npx hardhat node --config hardhat.node.config.ts
```

That node mines every two seconds, which the commit-reveal cycle needs.

**2. Deploy into it.**

```bash
cp backend/.env.example backend/.env
cd contracts
npx hardhat run scripts/deploy-local.ts --network localhost
```

Fill in `SECRET_KEY` before the first run; the deploy script fills in the rest.
It installs a mock Blast precompile, deploys the proxy behind its proxy admin,
funds the relayer, and writes `CONTRACT_ADDRESS`, `CONTRACT_START_BLOCK`,
`CHAIN_ID` and `RPC_URL` into `backend/.env`.

**3. Start the backend.**

```bash
docker compose up -d --force-recreate
```

`--force-recreate` matters: `docker compose restart` reuses the environment the
containers started with, so after a redeploy the indexer would keep watching the
old contract. The API answers on `http://localhost:8000/api`.

**4. Start the frontend.**

```bash
cd frontend
npm install
npm start
```

Point MetaMask at `http://127.0.0.1:8545`, chain id 31337, and import one of the
accounts the Hardhat node prints.

## Running against Blast Sepolia

```bash
node scripts/new-wallet.js deployer
node scripts/new-wallet.js relayer
```

Each command writes a private key into the matching `.env` and prints only the
address. Fund both from a Blast Sepolia faucet, then:

```bash
cd contracts
npm run deploy:sepolia
```

Put the deployed address and its block into `backend/.env` and bring the stack
up as above.

The frontend learns where the API lives at build time, not from a value edited
into the source:

```bash
cd frontend
API_BASE_URL=https://api.your-host/api npm run set-env
npm run build
```

`CHAIN_ID`, `CHAIN_NAME`, `RPC_URL` and `BLOCK_EXPLORER_URL` may be set the same
way and otherwise keep the Blast Sepolia values already in the file, so pointing
a build at a different host needs no code change.

## Tests

```bash
cd contracts && npm test && npm run coverage
cd backend   && poetry run pytest
cd frontend  && npm test && npm run build
```

With the whole stack running, `cd frontend && npm run e2e` drives a real browser
through it: a wallet is injected that forwards every call to the local chain, an
orb is opened, and the test waits for the relayer to reveal it and the indexer
to report it back through the API. Those specs need the stack, so CI does not
run them.

Contract coverage sits at 99% of statements and 93% of branches, and
`scripts/check-coverage.js` fails the build below the floor. Nothing runs these
for you: the project deploys nowhere yet, so it carries no CI. Before a commit,
`npm run export-abi` in `contracts` and `npm run sync-abi` in `frontend` keep the
ABI copies from drifting apart.

## Environment

`backend/.env.example` lists every variable the backend reads. Nothing has a
production default baked into the code: the secret key, the database URL, the
allowed hosts, the CORS origins, the RPC endpoint, the contract address and the
relayer key all come from the environment, and the app refuses to start without
the ones it cannot invent.

## What is deliberately missing

- The API has no public host yet, so the committed `apiBaseUrl` still points at
  a placeholder domain until `API_BASE_URL` is set for a real deploy.
- A committed orb resolves when its receipt returns or on the next page load.
  A socket would let a second tab update on its own.

## Licence

Testnet software. Points are points; they are not currency and they are not a
promise of anything.
