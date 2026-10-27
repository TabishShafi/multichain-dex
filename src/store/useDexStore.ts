"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChainId, Position, Quote, Transaction, TxType } from "@/lib/types";
import { CHAINS, CHAIN_MAP } from "@/lib/chains";
import { TOKEN_MAP, tokensOnChain } from "@/lib/tokens";
import { fakeAddress, fakeHash } from "@/lib/random";
import { POOL_MAP } from "@/lib/pools";

export type Balances = Record<ChainId, Record<string, number>>;

export interface Toast {
  id: string;
  title: string;
  description?: string;
  kind: "pending" | "success" | "error" | "info";
  txId?: string;
}

interface DexState {
  hydrated: boolean;
  connected: boolean;
  address: string | null;
  solanaAddress: string | null;
  selectedChain: ChainId;
  slippage: number;
  balances: Balances;
  transactions: Transaction[];
  positions: Position[];
  toasts: Toast[];
  watchlist: string[];

  setHydrated: () => void;
  connect: () => void;
  disconnect: () => void;
  setChain: (chain: ChainId) => void;
  setSlippage: (pct: number) => void;
  executeSwap: (quote: Quote) => string;
  addLiquidity: (poolId: string, amount0: number, amount1: number) => string;
  removeLiquidity: (poolId: string, fraction: number) => string;
  dismissToast: (id: string) => void;
  pushToast: (toast: Omit<Toast, "id">) => string;
  toggleWatch: (symbol: string) => void;
  resetDemo: () => void;
}

function seedBalances(): Balances {
  const seeds: Partial<Record<ChainId, Record<string, number>>> = {
    ethereum: { ETH: 4.2817, USDC: 12_450, WBTC: 0.1842, LINK: 320, UNI: 85, PEPE: 420_000_000, DAI: 2_500 },
    arbitrum: { ETH: 1.5, USDC: 6_200, ARB: 3_400, GMX: 42 },
    optimism: { ETH: 0.82, USDC: 1_800, OP: 1_250 },
    base: { ETH: 2.14, USDC: 8_900, AERO: 5_600 },
    polygon: { POL: 18_000, USDC: 2_300, ETH: 0.4 },
    bnb: { BNB: 12.5, USDT: 4_100, CAKE: 860 },
    avalanche: { AVAX: 140, USDC: 950 },
    solana: { SOL: 48.6, USDC: 5_400, JUP: 2_800, BONK: 95_000_000, RAY: 310 },
  };
  const out = {} as Balances;
  for (const chain of CHAINS) {
    out[chain.id] = {};
    for (const t of tokensOnChain(chain.id)) out[chain.id][t.symbol] = seeds[chain.id]?.[t.symbol] ?? 0;
  }
  return out;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const PENDING_MS = 2400;

export const useDexStore = create<DexState>()(
  persist(
    (set, get) => {
      const settle = (txId: string, toastId: string, title: string, description: string) => {
        setTimeout(() => {
          set((s) => ({
            transactions: s.transactions.map((t) => (t.id === txId ? { ...t, status: "confirmed" } : t)),
            toasts: s.toasts.map((t) => (t.id === toastId ? { ...t, kind: "success", title, description } : t)),
          }));
          setTimeout(() => get().dismissToast(toastId), 5000);
        }, PENDING_MS);
      };

      const recordTx = (tx: Omit<Transaction, "id" | "hash" | "timestamp" | "status">): Transaction => {
        const id = uid();
        const full: Transaction = {
          ...tx,
          id,
          status: "pending",
          timestamp: Date.now(),
          hash: fakeHash(id, CHAIN_MAP[tx.chain].type === "solana"),
        };
        set((s) => ({ transactions: [full, ...s.transactions].slice(0, 50) }));
        return full;
      };

      return {
        hydrated: false,
        connected: false,
        address: null,
        solanaAddress: null,
        selectedChain: "ethereum",
        slippage: 0.5,
        balances: seedBalances(),
        transactions: [],
        positions: [],
        toasts: [],
        watchlist: ["ETH", "SOL", "ARB"],

        setHydrated: () => set({ hydrated: true }),

        connect: () => {
          const seed = `wallet-${Date.now()}`;
          set({ connected: true, address: fakeAddress(seed), solanaAddress: fakeHash(seed, true).slice(0, 44) });
          get().pushToast({ kind: "success", title: "Wallet connected", description: "Demo wallet funded on 8 chains" });
        },

        disconnect: () => set({ connected: false, address: null, solanaAddress: null }),
        setChain: (chain) => set({ selectedChain: chain }),
        setSlippage: (pct) => set({ slippage: Math.min(50, Math.max(0.01, pct)) }),

        executeSwap: (quote) => {
          const { balances } = get();
          const next: Balances = structuredClone(balances);
          next[quote.chainIn][quote.tokenIn] = Math.max(0, (next[quote.chainIn][quote.tokenIn] ?? 0) - quote.amountIn);
          next[quote.chainOut][quote.tokenOut] = (next[quote.chainOut][quote.tokenOut] ?? 0) + quote.amountOut;
          set({ balances: next });

          const type: TxType = quote.crossChain ? "bridge" : "swap";
          const tx = recordTx({
            type,
            chain: quote.chainIn,
            toChain: quote.crossChain ? quote.chainOut : undefined,
            tokenIn: quote.tokenIn,
            amountIn: quote.amountIn,
            tokenOut: quote.tokenOut,
            amountOut: quote.amountOut,
          });
          const toastId = get().pushToast({
            kind: "pending",
            title: quote.crossChain ? "Cross-chain swap submitted" : "Swap submitted",
            description: `${quote.amountIn.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${quote.tokenIn} → ${quote.tokenOut}`,
            txId: tx.id,
          });
          settle(
            tx.id,
            toastId,
            quote.crossChain ? "Cross-chain swap confirmed" : "Swap confirmed",
            `Received ${quote.amountOut.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${quote.tokenOut} on ${CHAIN_MAP[quote.chainOut].name}`,
          );
          return tx.id;
        },

        addLiquidity: (poolId, amount0, amount1) => {
          const pool = POOL_MAP[poolId];
          const usd = amount0 * TOKEN_MAP[pool.token0].price + amount1 * TOKEN_MAP[pool.token1].price;
          const next: Balances = structuredClone(get().balances);
          next[pool.chain][pool.token0] = Math.max(0, (next[pool.chain][pool.token0] ?? 0) - amount0);
          next[pool.chain][pool.token1] = Math.max(0, (next[pool.chain][pool.token1] ?? 0) - amount1);
          const positions = [...get().positions];
          const existing = positions.find((p) => p.poolId === poolId);
          if (existing) existing.liquidityUsd += usd;
          else positions.push({ poolId, liquidityUsd: usd, depositedAt: Date.now() });
          set({ balances: next, positions });

          const tx = recordTx({ type: "add-liquidity", chain: pool.chain, tokenIn: pool.token0, amountIn: amount0, tokenOut: pool.token1, amountOut: amount1 });
          const toastId = get().pushToast({ kind: "pending", title: "Adding liquidity", description: `${pool.token0}/${pool.token1} on ${CHAIN_MAP[pool.chain].name}`, txId: tx.id });
          settle(tx.id, toastId, "Liquidity added", `Position opened in ${pool.token0}/${pool.token1} ${pool.feeTier}%`);
          return tx.id;
        },

        removeLiquidity: (poolId, fraction) => {
          const pool = POOL_MAP[poolId];
          const position = get().positions.find((p) => p.poolId === poolId);
          if (!position) return "";
          const usd = position.liquidityUsd * fraction;
          const amount0 = usd / 2 / TOKEN_MAP[pool.token0].price;
          const amount1 = usd / 2 / TOKEN_MAP[pool.token1].price;
          const next: Balances = structuredClone(get().balances);
          next[pool.chain][pool.token0] = (next[pool.chain][pool.token0] ?? 0) + amount0;
          next[pool.chain][pool.token1] = (next[pool.chain][pool.token1] ?? 0) + amount1;
          const positions = get()
            .positions.map((p) => (p.poolId === poolId ? { ...p, liquidityUsd: p.liquidityUsd - usd } : p))
            .filter((p) => p.liquidityUsd > 0.01);
          set({ balances: next, positions });

          const tx = recordTx({ type: "remove-liquidity", chain: pool.chain, tokenIn: pool.token0, amountIn: amount0, tokenOut: pool.token1, amountOut: amount1 });
          const toastId = get().pushToast({ kind: "pending", title: "Removing liquidity", description: `${Math.round(fraction * 100)}% of ${pool.token0}/${pool.token1}`, txId: tx.id });
          settle(tx.id, toastId, "Liquidity removed", `Withdrew ${usd.toLocaleString(undefined, { style: "currency", currency: "USD" })}`);
          return tx.id;
        },

        pushToast: (toast) => {
          const id = uid();
          set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-4) }));
          if (toast.kind !== "pending") setTimeout(() => get().dismissToast(id), 4500);
          return id;
        },

        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

        toggleWatch: (symbol) =>
          set((s) => ({ watchlist: s.watchlist.includes(symbol) ? s.watchlist.filter((w) => w !== symbol) : [...s.watchlist, symbol] })),

        resetDemo: () => set({ balances: seedBalances(), transactions: [], positions: [] }),
      };
    },
    {
      name: "prism-dex",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        connected: s.connected,
        address: s.address,
        solanaAddress: s.solanaAddress,
        selectedChain: s.selectedChain,
        slippage: s.slippage,
        balances: s.balances,
        transactions: s.transactions.map((t) => (t.status === "pending" ? { ...t, status: "confirmed" as const } : t)),
        positions: s.positions,
        watchlist: s.watchlist,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export function useChainBalance(chain: ChainId, symbol: string): number {
  return useDexStore((s) => s.balances[chain]?.[symbol] ?? 0);
}
