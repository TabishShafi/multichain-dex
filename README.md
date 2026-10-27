# Prism — Multi-chain DEX prototype

A front-end prototype of a decentralized exchange that works across eight networks
(Ethereum, Arbitrum, Optimism, Base, Polygon, BNB Chain, Avalanche and Solana) from a single interface.

Everything — balances, pools, prices, routing and transactions — is **simulated locally** so the app runs
with no wallet extension, RPC endpoint or API key. It is meant for design/UX exploration and as a scaffold
for wiring in real chains later.

## Features

- **Swap** — constant-product AMM quotes with multi-hop routing across fee tiers, price impact, slippage
  settings, min-received, gas estimate, and an animated route visualizer. Picking different chains on each
  side turns it into a **cross-chain swap** (swap → bridge → swap).
- **Bridge** — move the same asset between networks with a flat fee and estimated settlement time.
- **Pools** — 47 pools across all chains with TVL / volume / APR, filtering, sorting, and add/remove liquidity flows.
- **Portfolio** — net worth aggregated across chains, per-chain allocation, token holdings, LP positions, watchlist and activity.
- **Demo wallet** — one click funds a wallet on all 8 chains. State persists in `localStorage`; reset from the wallet menu.
- Dark glassmorphic UI, responsive down to mobile, no component library.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4
- [Zustand](https://github.com/pmndrs/zustand) for wallet / transaction state
- [lucide-react](https://lucide.dev) icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Project layout

```
src/
  app/            routes: / (landing), /swap, /bridge, /pools, /portfolio
  components/     UI: SwapCard, PriceChart, RouteVisualizer, TokenSelectModal, LiquidityModal, Navbar, …
  lib/
    chains.ts     supported networks + metadata
    tokens.ts     token list with chain availability and mock prices
    pools.ts      pool definitions; reserves derived from TVL
    pricing.ts    quote engine: x*y=k swaps, 2-hop routing, bridge legs
    random.ts     seeded RNG for deterministic charts / hashes
  store/
    useDexStore.ts  Zustand store (wallet, balances, txs, positions, toasts)
```

## Wiring real chains

The UI is decoupled from data through `src/lib/*` and the store actions in `useDexStore.ts`.
To go live you would replace:

- `getQuote()` in `pricing.ts` with calls to an aggregator / on-chain quoter
- `connect()` / `executeSwap()` in the store with wagmi + viem (EVM) and `@solana/wallet-adapter`
- `TOKENS` / `POOLS` with a token list and indexed pool data

## Disclaimer

Prototype only. Nothing here moves real assets and nothing is audited.
