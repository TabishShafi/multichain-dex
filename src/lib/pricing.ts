import type { ChainId, Pool, Quote, RouteHop } from "./types";
import { POOLS, poolReserves } from "./pools";
import { TOKEN_MAP } from "./tokens";
import { CHAIN_MAP } from "./chains";

const BRIDGE_TOKENS = ["USDC", "ETH", "USDT"];
const BRIDGE_FEE_BPS = 4;

function swapThroughPool(pool: Pool, tokenIn: string, amountIn: number): RouteHop | null {
  if (amountIn <= 0) return null;
  const { reserve0, reserve1 } = poolReserves(pool);
  const forward = pool.token0 === tokenIn;
  if (!forward && pool.token1 !== tokenIn) return null;
  const rIn = forward ? reserve0 : reserve1;
  const rOut = forward ? reserve1 : reserve0;
  const afterFee = amountIn * (1 - pool.feeTier / 100);
  const amountOut = (rOut * afterFee) / (rIn + afterFee);
  return {
    poolId: pool.id,
    chain: pool.chain,
    tokenIn,
    tokenOut: forward ? pool.token1 : pool.token0,
    feeTier: pool.feeTier,
    amountIn,
    amountOut,
  };
}

function bestSingleChainRoute(chain: ChainId, tokenIn: string, tokenOut: string, amountIn: number): RouteHop[] | null {
  if (tokenIn === tokenOut) return [];
  const chainPools = POOLS.filter((p) => p.chain === chain);
  let best: RouteHop[] | null = null;
  let bestOut = 0;

  for (const pool of chainPools) {
    const hop = swapThroughPool(pool, tokenIn, amountIn);
    if (hop && hop.tokenOut === tokenOut && hop.amountOut > bestOut) {
      best = [hop];
      bestOut = hop.amountOut;
    }
  }

  for (const first of chainPools) {
    const hop1 = swapThroughPool(first, tokenIn, amountIn);
    if (!hop1 || hop1.tokenOut === tokenOut) continue;
    for (const second of chainPools) {
      if (second.id === first.id) continue;
      const hop2 = swapThroughPool(second, hop1.tokenOut, hop1.amountOut);
      if (hop2 && hop2.tokenOut === tokenOut && hop2.amountOut > bestOut) {
        best = [hop1, hop2];
        bestOut = hop2.amountOut;
      }
    }
  }
  return best;
}

function routeFeeUsd(hops: RouteHop[]): number {
  return hops.reduce((sum, h) => sum + h.amountIn * (h.feeTier / 100) * TOKEN_MAP[h.tokenIn].price, 0);
}

export function getQuote(params: {
  tokenIn: string;
  tokenOut: string;
  chainIn: ChainId;
  chainOut: ChainId;
  amountIn: number;
  slippagePct: number;
}): Quote | null {
  const { tokenIn, tokenOut, chainIn, chainOut, amountIn, slippagePct } = params;
  if (amountIn <= 0 || !TOKEN_MAP[tokenIn] || !TOKEN_MAP[tokenOut]) return null;
  const crossChain = chainIn !== chainOut;
  const gasUsd = CHAIN_MAP[chainIn].gasUsd + (crossChain ? CHAIN_MAP[chainOut].gasUsd : 0);

  let hops: RouteHop[] | null = null;
  let bridgeFeeUsd = 0;
  let estimatedSeconds = CHAIN_MAP[chainIn].avgBlockTime * 2 + 3;

  if (!crossChain) {
    hops = bestSingleChainRoute(chainIn, tokenIn, tokenOut, amountIn);
  } else {
    let bestOut = 0;
    for (const bridgeToken of BRIDGE_TOKENS) {
      if (!TOKEN_MAP[bridgeToken].chains.includes(chainIn) || !TOKEN_MAP[bridgeToken].chains.includes(chainOut)) continue;
      const leg1 = bestSingleChainRoute(chainIn, tokenIn, bridgeToken, amountIn);
      if (leg1 === null) continue;
      const bridgedIn = leg1.length ? leg1[leg1.length - 1].amountOut : amountIn;
      const fee = bridgedIn * (BRIDGE_FEE_BPS / 10_000);
      const bridgedOut = bridgedIn - fee;
      const leg2 = bestSingleChainRoute(chainOut, bridgeToken, tokenOut, bridgedOut);
      if (leg2 === null) continue;
      const finalOut = leg2.length ? leg2[leg2.length - 1].amountOut : bridgedOut;
      if (finalOut > bestOut) {
        bestOut = finalOut;
        const bridgeHop: RouteHop = {
          poolId: `bridge:${chainIn}->${chainOut}:${bridgeToken}`,
          chain: chainOut,
          tokenIn: bridgeToken,
          tokenOut: bridgeToken,
          feeTier: BRIDGE_FEE_BPS / 100,
          amountIn: bridgedIn,
          amountOut: bridgedOut,
        };
        hops = [...leg1, bridgeHop, ...leg2];
        bridgeFeeUsd = fee * TOKEN_MAP[bridgeToken].price;
      }
    }
    estimatedSeconds = 45 + CHAIN_MAP[chainIn].avgBlockTime * 6 + CHAIN_MAP[chainOut].avgBlockTime * 2;
  }

  if (hops === null) return null;
  const amountOut = hops.length ? hops[hops.length - 1].amountOut : amountIn;
  const inUsd = amountIn * TOKEN_MAP[tokenIn].price;
  const outUsd = amountOut * TOKEN_MAP[tokenOut].price;
  const priceImpact = inUsd > 0 ? Math.max(0, (1 - outUsd / inUsd) * 100) : 0;
  const swapHops = hops.filter((h) => !h.poolId.startsWith("bridge:"));

  return {
    tokenIn,
    tokenOut,
    chainIn,
    chainOut,
    amountIn,
    amountOut,
    minReceived: amountOut * (1 - slippagePct / 100),
    priceImpact,
    feeUsd: routeFeeUsd(swapHops),
    gasUsd,
    bridgeFeeUsd,
    estimatedSeconds,
    hops,
    crossChain,
  };
}

export function spotPrice(tokenIn: string, tokenOut: string): number {
  const a = TOKEN_MAP[tokenIn]?.price ?? 0;
  const b = TOKEN_MAP[tokenOut]?.price ?? 0;
  return b > 0 ? a / b : 0;
}
