import type { Chain, ChainId } from "./types";

export const CHAINS: Chain[] = [
  { id: "ethereum", name: "Ethereum", shortName: "ETH", color: "#627EEA", nativeSymbol: "ETH", explorer: "https://etherscan.io", avgBlockTime: 12, gasUsd: 4.2, type: "evm", tvl: 2_840_000_000, volume24h: 1_120_000_000 },
  { id: "arbitrum", name: "Arbitrum One", shortName: "ARB", color: "#28A0F0", nativeSymbol: "ETH", explorer: "https://arbiscan.io", avgBlockTime: 0.25, gasUsd: 0.08, type: "evm", tvl: 912_000_000, volume24h: 486_000_000 },
  { id: "optimism", name: "Optimism", shortName: "OP", color: "#FF0420", nativeSymbol: "ETH", explorer: "https://optimistic.etherscan.io", avgBlockTime: 2, gasUsd: 0.06, type: "evm", tvl: 388_000_000, volume24h: 142_000_000 },
  { id: "base", name: "Base", shortName: "BASE", color: "#0052FF", nativeSymbol: "ETH", explorer: "https://basescan.org", avgBlockTime: 2, gasUsd: 0.03, type: "evm", tvl: 1_240_000_000, volume24h: 732_000_000 },
  { id: "polygon", name: "Polygon", shortName: "POL", color: "#8247E5", nativeSymbol: "POL", explorer: "https://polygonscan.com", avgBlockTime: 2, gasUsd: 0.01, type: "evm", tvl: 296_000_000, volume24h: 98_000_000 },
  { id: "bnb", name: "BNB Chain", shortName: "BNB", color: "#F3BA2F", nativeSymbol: "BNB", explorer: "https://bscscan.com", avgBlockTime: 3, gasUsd: 0.12, type: "evm", tvl: 684_000_000, volume24h: 318_000_000 },
  { id: "avalanche", name: "Avalanche", shortName: "AVAX", color: "#E84142", nativeSymbol: "AVAX", explorer: "https://snowtrace.io", avgBlockTime: 2, gasUsd: 0.05, type: "evm", tvl: 172_000_000, volume24h: 54_000_000 },
  { id: "solana", name: "Solana", shortName: "SOL", color: "#14F195", nativeSymbol: "SOL", explorer: "https://solscan.io", avgBlockTime: 0.4, gasUsd: 0.002, type: "solana", tvl: 1_560_000_000, volume24h: 1_480_000_000 },
];

export const CHAIN_MAP = Object.fromEntries(CHAINS.map((c) => [c.id, c])) as Record<ChainId, Chain>;

export function getChain(id: ChainId): Chain {
  return CHAIN_MAP[id];
}
