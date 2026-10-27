"use client";

import { SwapCard } from "@/components/SwapCard";
import { RecentActivity } from "@/components/RecentActivity";
import { CHAINS } from "@/lib/chains";
import { ChainIcon } from "@/components/icons";
import { useDexStore } from "@/store/useDexStore";
import { ShieldCheck, Timer, Coins } from "lucide-react";

export default function BridgePage() {
  const hydrated = useDexStore((s) => s.hydrated);
  return (
    <div className="pt-8 sm:pt-12 grid lg:grid-cols-[1fr_440px] gap-6 items-start">
      <div className="order-2 lg:order-1 space-y-6 animate-fade-up [animation-delay:80ms]">
        <div className="glass rounded-3xl p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Move assets between {CHAINS.length} chains</h2>
          <p className="mt-2 text-sm text-white/55 max-w-xl">
            Prism bridges through canonical stable and native routes with a flat 0.04% fee. Liquidity on the destination chain is pre-positioned, so transfers settle in about a minute instead of the 7-day L2 withdrawal window.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { icon: Timer, title: "~1 minute", sub: "median settlement" },
              { icon: Coins, title: "0.04%", sub: "flat bridge fee" },
              { icon: ShieldCheck, title: "Intent-based", sub: "no wrapped tokens" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/5 p-4">
                <f.icon size={18} className="text-brand-2" />
                <div className="mt-3 text-lg font-semibold">{f.title}</div>
                <div className="text-xs text-white/50">{f.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">Supported networks</div>
            <div className="flex flex-wrap gap-2">
              {CHAINS.map((c) => (
                <div key={c.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1.5 pr-3 py-1.5 text-sm">
                  <ChainIcon chain={c.id} size={22} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        <RecentActivity limit={6} filter={(t) => t.type === "bridge"} title="Recent bridges" />
      </div>
      <div className="order-1 lg:order-2 lg:sticky lg:top-24 animate-fade-up">
        {hydrated ? <SwapCard mode="bridge" /> : <div className="glass-strong rounded-3xl h-[420px] shimmer-bg" />}
      </div>
    </div>
  );
}
