"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { TokenWithChain, ChainIcon } from "./icons";
import { getQuote } from "@/lib/pricing";
import { formatAmount, formatUsd } from "@/lib/format";
import { CHAIN_MAP } from "@/lib/chains";
import type { ChainId } from "@/lib/types";
import Link from "next/link";

const DEMOS: { tokenIn: string; chainIn: ChainId; tokenOut: string; chainOut: ChainId; amount: number }[] = [
  { tokenIn: "ETH", chainIn: "ethereum", tokenOut: "SOL", chainOut: "solana", amount: 2.5 },
  { tokenIn: "USDC", chainIn: "arbitrum", tokenOut: "AERO", chainOut: "base", amount: 5000 },
  { tokenIn: "BNB", chainIn: "bnb", tokenOut: "ARB", chainOut: "arbitrum", amount: 10 },
  { tokenIn: "SOL", chainIn: "solana", tokenOut: "WBTC", chainOut: "ethereum", amount: 120 },
];

export function LandingSwapPreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % DEMOS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const d = DEMOS[i];
  const q = getQuote({ ...d, amountIn: d.amount, slippagePct: 0.5 });

  return (
    <div className="glass-strong rounded-3xl p-5 relative">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-brand/40 via-transparent to-brand-2/30 -z-10 blur-xl opacity-60" />
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Swap</span>
        <span className="text-[10px] uppercase tracking-wider rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-brand-2">cross-chain</span>
      </div>
      <div key={i} className="mt-3 space-y-1.5 animate-fade-up">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
          <div className="flex justify-between text-xs text-white/50"><span>Sell</span><span className="flex items-center gap-1"><ChainIcon chain={d.chainIn} size={14} bordered={false} /> {CHAIN_MAP[d.chainIn].name}</span></div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-3xl font-medium tabular">{formatAmount(d.amount)}</span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 py-1 text-sm font-semibold"><TokenWithChain symbol={d.tokenIn} chain={d.chainIn} size={26} /> {d.tokenIn}</span>
          </div>
        </div>
        <div className="relative h-2"><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-xl grid place-items-center bg-surface-2 border border-white/10"><ArrowDown size={14} /></span></div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
          <div className="flex justify-between text-xs text-white/50"><span>Buy</span><span className="flex items-center gap-1"><ChainIcon chain={d.chainOut} size={14} bordered={false} /> {CHAIN_MAP[d.chainOut].name}</span></div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-3xl font-medium tabular">{q ? formatAmount(q.amountOut, 4) : "—"}</span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 py-1 text-sm font-semibold"><TokenWithChain symbol={d.tokenOut} chain={d.chainOut} size={26} /> {d.tokenOut}</span>
          </div>
        </div>
      </div>
      {q && (
        <div className="mt-3 flex items-center justify-between text-xs text-white/50 px-1">
          <span>{q.hops.length} hops · impact {q.priceImpact.toFixed(2)}%</span>
          <span>fees {formatUsd(q.feeUsd + q.gasUsd + q.bridgeFeeUsd)} · ~{Math.round(q.estimatedSeconds)}s</span>
        </div>
      )}
      <Link href="/swap" className="btn-primary mt-3 block w-full rounded-2xl py-3 text-center font-semibold">Try it</Link>
    </div>
  );
}
