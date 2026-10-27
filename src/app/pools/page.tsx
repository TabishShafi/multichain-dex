"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Droplets } from "lucide-react";
import clsx from "clsx";
import { POOLS } from "@/lib/pools";
import { CHAINS } from "@/lib/chains";
import type { ChainId, Pool } from "@/lib/types";
import { formatUsd } from "@/lib/format";
import { TokenIcon, ChainIcon } from "@/components/icons";
import { Stat } from "@/components/ui";
import { LiquidityModal } from "@/components/LiquidityModal";
import { useDexStore } from "@/store/useDexStore";

type SortKey = "tvl" | "volume24h" | "apr";

export default function PoolsPage() {
  const [chainFilter, setChainFilter] = useState<ChainId | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("tvl");
  const [desc, setDesc] = useState(true);
  const [active, setActive] = useState<Pool | null>(null);
  const positions = useDexStore((s) => s.positions);

  const pools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POOLS.filter((p) => chainFilter === "all" || p.chain === chainFilter)
      .filter((p) => !q || `${p.token0}/${p.token1}`.toLowerCase().includes(q) || p.chain.includes(q))
      .sort((a, b) => (desc ? b[sort] - a[sort] : a[sort] - b[sort]));
  }, [chainFilter, query, sort, desc]);

  const totalTvl = POOLS.reduce((s, p) => s + p.tvl, 0);
  const totalVol = POOLS.reduce((s, p) => s + p.volume24h, 0);
  const fees = POOLS.reduce((s, p) => s + p.volume24h * (p.feeTier / 100), 0);

  const toggleSort = (k: SortKey) => {
    if (sort === k) setDesc((d) => !d);
    else {
      setSort(k);
      setDesc(true);
    }
  };

  return (
    <div className="pt-8 sm:pt-12 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Liquidity pools</h1>
          <p className="text-sm text-white/55 mt-1">Earn fees by providing liquidity on any of {CHAINS.length} chains.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total TVL" value={formatUsd(totalTvl, { compact: true })} accent />
        <Stat label="24h volume" value={formatUsd(totalVol, { compact: true })} />
        <Stat label="24h fees to LPs" value={formatUsd(fees, { compact: true })} />
        <Stat label="Active pools" value={POOLS.length} sub={`across ${CHAINS.length} chains`} />
      </div>

      <div className="mt-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 lg:mx-0 lg:px-0">
          <button onClick={() => setChainFilter("all")} className={clsx("rounded-full border px-3 py-1.5 text-xs shrink-0 transition", chainFilter === "all" ? "border-white/30 bg-white/10" : "border-white/10 hover:bg-white/5 text-white/60")}>All chains</button>
          {CHAINS.map((c) => (
            <button key={c.id} onClick={() => setChainFilter(c.id)} className={clsx("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs shrink-0 transition", chainFilter === c.id ? "border-white/30 bg-white/10" : "border-white/10 hover:bg-white/5 text-white/60")}>
              <ChainIcon chain={c.id} size={16} bordered={false} /> {c.shortName}
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pools" className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm outline-none focus:border-brand/60" />
        </div>
      </div>

      <div className="mt-4 glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-white/40 border-b border-white/5">
                <th className="text-left font-medium px-5 py-3">#</th>
                <th className="text-left font-medium px-3 py-3">Pool</th>
                {(["tvl", "volume24h", "apr"] as SortKey[]).map((k) => (
                  <th key={k} className="text-right font-medium px-3 py-3">
                    <button onClick={() => toggleSort(k)} className={clsx("inline-flex items-center gap-1 hover:text-white", sort === k && "text-white")}>
                      {k === "tvl" ? "TVL" : k === "volume24h" ? "Volume 24h" : "APR"} <ArrowUpDown size={12} />
                    </button>
                  </th>
                ))}
                <th className="text-right font-medium px-5 py-3">Your position</th>
              </tr>
            </thead>
            <tbody>
              {pools.map((p, i) => {
                const pos = positions.find((x) => x.poolId === p.id);
                return (
                  <tr key={p.id} onClick={() => setActive(p)} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] cursor-pointer transition">
                    <td className="px-5 py-3.5 text-white/40 tabular">{i + 1}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex -space-x-2.5 shrink-0">
                          <TokenIcon symbol={p.token0} size={30} />
                          <TokenIcon symbol={p.token1} size={30} className="ring-2 ring-surface" />
                        </span>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {p.token0}/{p.token1}
                            <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5 text-white/60 tabular">{p.feeTier}%</span>
                          </div>
                          <div className="text-xs text-white/45 flex items-center gap-1.5 mt-0.5"><ChainIcon chain={p.chain} size={12} bordered={false} /> {CHAINS.find((c) => c.id === p.chain)!.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular">{formatUsd(p.tvl, { compact: true })}</td>
                    <td className="px-3 py-3.5 text-right tabular">{formatUsd(p.volume24h, { compact: true })}</td>
                    <td className="px-3 py-3.5 text-right tabular">
                      <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", p.apr > 20 ? "bg-up/15 text-up" : p.apr > 5 ? "bg-brand/15 text-brand-2" : "bg-white/5 text-white/70")}>{p.apr.toFixed(2)}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular">
                      {pos ? <span className="text-white">{formatUsd(pos.liquidityUsd)}</span> : <span className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-brand-2"><Droplets size={12} /> Add</span>}
                    </td>
                  </tr>
                );
              })}
              {pools.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">No pools match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LiquidityModal pool={active} open={active !== null} onClose={() => setActive(null)} />
    </div>
  );
}
