import type { ChainId, Pool } from "./types";
import { hashString, seededRandom } from "./random";
import { TOKEN_MAP } from "./tokens";

type PoolSeed = [ChainId, string, string, number, number];

const SEEDS: PoolSeed[] = [
  ["ethereum", "ETH", "USDC", 0.05, 412_000_000],
  ["ethereum", "ETH", "USDT", 0.05, 186_000_000],
  ["ethereum", "WBTC", "ETH", 0.3, 268_000_000],
  ["ethereum", "WBTC", "USDC", 0.3, 142_000_000],
  ["ethereum", "USDC", "USDT", 0.01, 320_000_000],
  ["ethereum", "DAI", "USDC", 0.01, 118_000_000],
  ["ethereum", "LINK", "ETH", 0.3, 64_000_000],
  ["ethereum", "UNI", "ETH", 0.3, 48_000_000],
  ["ethereum", "AAVE", "ETH", 0.3, 52_000_000],
  ["ethereum", "PEPE", "ETH", 1, 36_000_000],
  ["ethereum", "SOL", "ETH", 0.3, 22_000_000],
  ["arbitrum", "ETH", "USDC", 0.05, 212_000_000],
  ["arbitrum", "ARB", "ETH", 0.3, 96_000_000],
  ["arbitrum", "ARB", "USDC", 0.3, 58_000_000],
  ["arbitrum", "WBTC", "ETH", 0.05, 74_000_000],
  ["arbitrum", "GMX", "ETH", 0.3, 41_000_000],
  ["arbitrum", "USDC", "USDT", 0.01, 88_000_000],
  ["arbitrum", "LINK", "ETH", 0.3, 18_000_000],
  ["optimism", "ETH", "USDC", 0.05, 104_000_000],
  ["optimism", "OP", "ETH", 0.3, 62_000_000],
  ["optimism", "OP", "USDC", 0.3, 28_000_000],
  ["optimism", "WBTC", "ETH", 0.3, 24_000_000],
  ["base", "ETH", "USDC", 0.05, 318_000_000],
  ["base", "AERO", "ETH", 0.3, 92_000_000],
  ["base", "AERO", "USDC", 0.3, 44_000_000],
  ["base", "WBTC", "USDC", 0.3, 56_000_000],
  ["base", "PEPE", "ETH", 1, 14_000_000],
  ["polygon", "ETH", "USDC", 0.05, 68_000_000],
  ["polygon", "POL", "USDC", 0.3, 54_000_000],
  ["polygon", "POL", "ETH", 0.3, 32_000_000],
  ["polygon", "USDC", "USDT", 0.01, 46_000_000],
  ["bnb", "BNB", "USDT", 0.05, 184_000_000],
  ["bnb", "BNB", "USDC", 0.05, 96_000_000],
  ["bnb", "ETH", "BNB", 0.3, 72_000_000],
  ["bnb", "CAKE", "BNB", 0.3, 58_000_000],
  ["bnb", "PEPE", "BNB", 1, 12_000_000],
  ["avalanche", "AVAX", "USDC", 0.05, 76_000_000],
  ["avalanche", "ETH", "AVAX", 0.3, 28_000_000],
  ["avalanche", "GMX", "AVAX", 0.3, 16_000_000],
  ["solana", "SOL", "USDC", 0.05, 486_000_000],
  ["solana", "SOL", "USDT", 0.05, 142_000_000],
  ["solana", "JUP", "SOL", 0.3, 118_000_000],
  ["solana", "JUP", "USDC", 0.3, 64_000_000],
  ["solana", "RAY", "SOL", 0.3, 52_000_000],
  ["solana", "BONK", "SOL", 1, 48_000_000],
  ["solana", "ETH", "SOL", 0.3, 36_000_000],
  ["solana", "USDC", "USDT", 0.01, 92_000_000],
];

export const POOLS: Pool[] = SEEDS.map(([chain, token0, token1, feeTier, tvl]) => {
  const id = `${chain}:${token0}-${token1}:${feeTier}`;
  const rand = seededRandom(hashString(id));
  const turnover = feeTier <= 0.01 ? 0.9 + rand() * 1.2 : feeTier <= 0.05 ? 0.4 + rand() * 0.8 : 0.08 + rand() * 0.35;
  const volume24h = tvl * turnover;
  const apr = ((volume24h * (feeTier / 100) * 365) / tvl) * 100;
  return { id, chain, token0, token1, feeTier, tvl, volume24h, apr };
});

export const POOL_MAP = Object.fromEntries(POOLS.map((p) => [p.id, p])) as Record<string, Pool>;

export function poolsOnChain(chain: ChainId): Pool[] {
  return POOLS.filter((p) => p.chain === chain);
}

export function poolReserves(pool: Pool): { reserve0: number; reserve1: number } {
  return {
    reserve0: pool.tvl / 2 / TOKEN_MAP[pool.token0].price,
    reserve1: pool.tvl / 2 / TOKEN_MAP[pool.token1].price,
  };
}

export function poolHasToken(pool: Pool, symbol: string): boolean {
  return pool.token0 === symbol || pool.token1 === symbol;
}

export function poolName(pool: Pool): string {
  return `${pool.token0}/${pool.token1}`;
}
