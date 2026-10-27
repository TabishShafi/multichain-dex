import type { ChainId, Token } from "./types";

const EVM: ChainId[] = ["ethereum", "arbitrum", "optimism", "base", "polygon", "bnb", "avalanche"];
const ALL: ChainId[] = [...EVM, "solana"];

export const TOKENS: Token[] = [
  { symbol: "ETH", name: "Ether", color: "#627EEA", price: 3412.58, change24h: 2.34, decimals: 18, chains: ["ethereum", "arbitrum", "optimism", "base", "polygon", "bnb", "avalanche", "solana"], category: "native" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", color: "#F7931A", price: 97_842.1, change24h: 1.12, decimals: 8, chains: EVM, category: "blue-chip" },
  { symbol: "USDC", name: "USD Coin", color: "#2775CA", price: 1.0, change24h: 0.01, decimals: 6, chains: ALL, category: "stable" },
  { symbol: "USDT", name: "Tether USD", color: "#26A17B", price: 0.9998, change24h: -0.02, decimals: 6, chains: ALL, category: "stable" },
  { symbol: "DAI", name: "Dai Stablecoin", color: "#F5AC37", price: 1.0004, change24h: 0.03, decimals: 18, chains: EVM, category: "stable" },
  { symbol: "SOL", name: "Solana", color: "#9945FF", price: 184.27, change24h: 5.81, decimals: 9, chains: ["solana", "ethereum", "bnb"], category: "native" },
  { symbol: "BNB", name: "BNB", color: "#F3BA2F", price: 612.4, change24h: -0.74, decimals: 18, chains: ["bnb", "ethereum"], category: "native" },
  { symbol: "POL", name: "Polygon Ecosystem Token", color: "#8247E5", price: 0.4821, change24h: -1.9, decimals: 18, chains: ["polygon", "ethereum"], category: "native" },
  { symbol: "AVAX", name: "Avalanche", color: "#E84142", price: 38.92, change24h: 3.05, decimals: 18, chains: ["avalanche", "ethereum"], category: "native" },
  { symbol: "ARB", name: "Arbitrum", color: "#28A0F0", price: 0.8734, change24h: 4.42, decimals: 18, chains: ["arbitrum", "ethereum"], category: "defi" },
  { symbol: "OP", name: "Optimism", color: "#FF0420", price: 1.942, change24h: 2.17, decimals: 18, chains: ["optimism", "ethereum"], category: "defi" },
  { symbol: "LINK", name: "Chainlink", color: "#2A5ADA", price: 18.63, change24h: 1.58, decimals: 18, chains: EVM, category: "defi" },
  { symbol: "UNI", name: "Uniswap", color: "#FF007A", price: 11.27, change24h: -2.31, decimals: 18, chains: ["ethereum", "arbitrum", "optimism", "polygon", "base"], category: "defi" },
  { symbol: "AAVE", name: "Aave", color: "#B6509E", price: 286.14, change24h: 6.72, decimals: 18, chains: ["ethereum", "arbitrum", "optimism", "polygon", "avalanche", "base"], category: "defi" },
  { symbol: "GMX", name: "GMX", color: "#4F60F0", price: 27.81, change24h: 0.93, decimals: 18, chains: ["arbitrum", "avalanche"], category: "defi" },
  { symbol: "AERO", name: "Aerodrome", color: "#2F6CF6", price: 1.284, change24h: 8.14, decimals: 18, chains: ["base"], category: "defi" },
  { symbol: "JUP", name: "Jupiter", color: "#C7F284", price: 0.9312, change24h: 3.9, decimals: 6, chains: ["solana"], category: "defi" },
  { symbol: "RAY", name: "Raydium", color: "#5AC4BE", price: 4.17, change24h: -0.6, decimals: 6, chains: ["solana"], category: "defi" },
  { symbol: "PEPE", name: "Pepe", color: "#3D8F3D", price: 0.00001842, change24h: 12.4, decimals: 18, chains: ["ethereum", "arbitrum", "base", "bnb"], category: "meme" },
  { symbol: "BONK", name: "Bonk", color: "#F5A623", price: 0.00003127, change24h: -4.3, decimals: 5, chains: ["solana"], category: "meme" },
  { symbol: "CAKE", name: "PancakeSwap", color: "#D1884F", price: 2.63, change24h: 1.2, decimals: 18, chains: ["bnb", "ethereum", "arbitrum"], category: "defi" },
];

export const TOKEN_MAP = Object.fromEntries(TOKENS.map((t) => [t.symbol, t])) as Record<string, Token>;

export function getToken(symbol: string): Token {
  return TOKEN_MAP[symbol];
}

export function tokensOnChain(chain: ChainId): Token[] {
  return TOKENS.filter((t) => t.chains.includes(chain));
}

export function usdValue(symbol: string, amount: number): number {
  return (TOKEN_MAP[symbol]?.price ?? 0) * amount;
}
