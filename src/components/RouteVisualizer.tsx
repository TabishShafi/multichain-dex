"use client";

import { ArrowRight, Shuffle } from "lucide-react";
import type { Quote } from "@/lib/types";
import { TokenIcon, ChainIcon, TokenWithChain } from "./icons";
import { getChain } from "@/lib/chains";

export function RouteVisualizer({ quote }: { quote: Quote }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
      <TokenWithChain symbol={quote.tokenIn} chain={quote.chainIn} size={30} />
      {quote.hops.length === 0 && (
        <>
          <Connector />
          <span className="text-xs text-white/50 shrink-0">Direct transfer</span>
        </>
      )}
      {quote.hops.map((h) => {
        const bridge = h.poolId.startsWith("bridge:");
        return (
          <div key={h.poolId} className="flex items-center gap-2 shrink-0">
            <Connector />
            {bridge ? (
              <div className="flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 text-[11px]">
                <Shuffle size={12} className="text-brand-2" />
                <span>Bridge</span>
                <ChainIcon chain={quote.chainIn} size={14} bordered={false} />
                <ArrowRight size={10} className="text-white/40" />
                <ChainIcon chain={h.chain} size={14} bordered={false} />
                <span className="text-white/50">{h.feeTier}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]">
                <ChainIcon chain={h.chain} size={14} bordered={false} />
                <span className="text-white/70">{getChain(h.chain).shortName}</span>
                <span className="text-white/30">·</span>
                <TokenIcon symbol={h.tokenIn} size={14} />
                <ArrowRight size={10} className="text-white/40" />
                <TokenIcon symbol={h.tokenOut} size={14} />
                <span className="text-white/50">{h.feeTier}%</span>
              </div>
            )}
          </div>
        );
      })}
      <Connector />
      <TokenWithChain symbol={quote.tokenOut} chain={quote.chainOut} size={30} />
    </div>
  );
}

function Connector() {
  return <span className="h-px w-5 shrink-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10" />;
}
