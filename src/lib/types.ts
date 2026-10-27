export type ChainId =
  | "ethereum"
  | "arbitrum"
  | "optimism"
  | "polygon"
  | "base"
  | "bnb"
  | "avalanche"
  | "solana";

export interface Chain {
  id: ChainId;
  name: string;
  shortName: string;
  color: string;
  nativeSymbol: string;
  explorer: string;
  avgBlockTime: number;
  gasUsd: number;
  type: "evm" | "solana";
  tvl: number;
  volume24h: number;
}

export interface Token {
  symbol: string;
  name: string;
  color: string;
  price: number;
  change24h: number;
  decimals: number;
  chains: ChainId[];
  category: "native" | "stable" | "blue-chip" | "defi" | "meme";
}

export interface Pool {
  id: string;
  chain: ChainId;
  token0: string;
  token1: string;
  feeTier: number;
  tvl: number;
  volume24h: number;
  apr: number;
}

export interface RouteHop {
  poolId: string;
  chain: ChainId;
  tokenIn: string;
  tokenOut: string;
  feeTier: number;
  amountIn: number;
  amountOut: number;
}

export interface Quote {
  tokenIn: string;
  tokenOut: string;
  chainIn: ChainId;
  chainOut: ChainId;
  amountIn: number;
  amountOut: number;
  minReceived: number;
  priceImpact: number;
  feeUsd: number;
  gasUsd: number;
  bridgeFeeUsd: number;
  estimatedSeconds: number;
  hops: RouteHop[];
  crossChain: boolean;
}

export type TxStatus = "pending" | "confirmed" | "failed";
export type TxType = "swap" | "bridge" | "add-liquidity" | "remove-liquidity";

export interface Transaction {
  id: string;
  type: TxType;
  status: TxStatus;
  chain: ChainId;
  toChain?: ChainId;
  tokenIn: string;
  amountIn: number;
  tokenOut: string;
  amountOut: number;
  hash: string;
  timestamp: number;
}

export interface Position {
  poolId: string;
  liquidityUsd: number;
  depositedAt: number;
}
