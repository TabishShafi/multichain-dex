"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Wallet, Droplets, ArrowLeftRight, Star } from "lucide-react";
import { useDexStore } from "@/store/useDexStore";
import { CHAINS, CHAIN_MAP } from "@/lib/chains";
import { TOKEN_MAP, usdValue } from "@/lib/tokens";
import { POOL_MAP } from "@/lib/pools";
import { formatAmount, formatUsd } from "@/lib/format";
import { TokenWithChain, ChainIcon, TokenIcon } from "@/components/icons";
import { Change, Stat } from "@/components/ui";
import { RecentActivity } from "@/components/RecentActivity";
import { LiquidityModal } from "@/components/LiquidityModal";
import type { ChainId, Pool } from "@/lib/types";
import { priceSeries } from "@/lib/random";

export default function PortfolioPage() {
  const { connected, connect, balances, positions, hydrated, watchlist, transactions } = useDexStore();
  const [chainFilter, setChainFilter] = useState<ChainId | "all">("all");
  const [activePool, setActivePool] = useState<Pool | null>(null);

  const holdings = useMemo(() => {
    const rows: { chain: ChainId; symbol: string; amount: number; usd: number }[] = [];
    for (const c of CHAINS) {
      for (const [symbol, amount] of Object.entries(balances[c.id] ?? {})) {
        if (amount > 0) rows.push({ chain: c.id, symbol, amount, usd: usdValue(symbol, amount) });
      }
    }
    return rows.sort((a, b) => b.usd - a.usd);
  }, [balances]);

  const perChain = CHAINS.map((c) => ({ chain: c, usd: holdings.filter((h) => h.chain === c.id).reduce((s, h) => s + h.usd, 0) })).sort((a, b) => b.usd - a.usd);
  const walletTotal = holdings.reduce((s, h) => s + h.usd, 0);
  const lpTotal = positions.reduce((s, p) => s + p.liquidityUsd, 0);
  const total = walletTotal + lpTotal;
  const change = holdings.reduce((s, h) => s + h.usd * (TOKEN_MAP[h.symbol].change24h / 100), 0);
  const changePct = walletTotal > 0 ? (change / (walletTotal - change)) * 100 : 0;
  const filtered = chainFilter === "all" ? holdings : holdings.filter((h) => h.chain === chainFilter);

  if (!hydrated) return <div className="pt-12 glass rounded-3xl h-80 shimmer-bg" />;

  if (!connected) {
    return (
      <div className="pt-24 flex flex-col items-center text-center animate-fade-up">
        <div className="h-20 w-20 rounded-3xl glass grid place-items-center">
          <Wallet size={32} className="text-brand-2" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Your multi-chain portfolio</h1>
        <p className="mt-2 text-white/55 max-w-md">Connect a wallet to see balances, LP positions and activity aggregated across all {CHAINS.length} supported networks.</p>
        <button onClick={connect} className="btn-primary mt-6 rounded-full px-6 py-3 font-semibold">Connect demo wallet</button>
      </div>
    );
  }

  return (
    <div className="pt-8 sm:pt-12 animate-fade-up">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-white/45">Net worth</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-semibold tabular">{formatUsd(total)}</span>
              <Change value={changePct} className="text-base" />
              <span className="text-sm text-white/40 tabular">{change >= 0 ? "+" : ""}{formatUsd(change)} today</span>
            </div>
            <Sparkline total={total} />
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-white/70"><Wallet size={14} className="text-brand-2" /> Wallet <span className="tabular text-white">{formatUsd(walletTotal)}</span></span>
              <span className="flex items-center gap-2 text-white/70"><Droplets size={14} className="text-brand-2" /> Liquidity <span className="tabular text-white">{formatUsd(lpTotal)}</span></span>
              <span className="flex items-center gap-2 text-white/70"><ArrowLeftRight size={14} className="text-brand-2" /> Transactions <span className="tabular text-white">{transactions.length}</span></span>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="text-xs uppercase tracking-wider text-white/45 mb-4">Allocation by chain</div>
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5">
            {perChain.filter((p) => p.usd > 0).map((p) => (
              <span key={p.chain.id} style={{ width: `${(p.usd / walletTotal) * 100}%`, background: p.chain.color }} title={`${p.chain.name} ${formatUsd(p.usd)}`} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {perChain.map((p) => (
              <button key={p.chain.id} onClick={() => setChainFilter(chainFilter === p.chain.id ? "all" : p.chain.id)} className={clsx("flex items-center justify-between text-xs rounded-lg px-2 py-1.5 -mx-2 transition", chainFilter === p.chain.id ? "bg-white/10" : "hover:bg-white/5")}>
                <span className="flex items-center gap-2 text-white/70"><ChainIcon chain={p.chain.id} size={16} bordered={false} /> {p.chain.name}</span>
                <span className="tabular">{walletTotal > 0 ? ((p.usd / walletTotal) * 100).toFixed(1) : "0.0"}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Assets" value={holdings.length} sub={`on ${perChain.filter((p) => p.usd > 0).length} chains`} />
        <Stat label="LP positions" value={positions.length} sub={positions.length ? `${formatUsd(lpTotal, { compact: true })} deposited` : "No positions yet"} />
        <Stat label="Est. LP yearly yield" value={formatUsd(positions.reduce((s, p) => s + (p.liquidityUsd * POOL_MAP[p.poolId].apr) / 100, 0), { compact: true })} accent />
        <Stat label="Top chain" value={perChain[0]?.usd > 0 ? perChain[0].chain.name : "—"} sub={perChain[0]?.usd > 0 ? formatUsd(perChain[0].usd, { compact: true }) : undefined} />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div className="glass rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="font-semibold">Tokens</h2>
            <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              <button onClick={() => setChainFilter("all")} className={clsx("rounded-full px-2.5 py-1 text-xs border shrink-0", chainFilter === "all" ? "border-white/30 bg-white/10" : "border-white/10 text-white/60")}>All</button>
              {perChain.filter((p) => p.usd > 0).map((p) => (
                <button key={p.chain.id} onClick={() => setChainFilter(p.chain.id)} className={clsx("rounded-full p-1 border shrink-0", chainFilter === p.chain.id ? "border-white/30 bg-white/10" : "border-white/10")}><ChainIcon chain={p.chain.id} size={16} bordered={false} /></button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto">
            {filtered.map((h) => (
              <div key={`${h.chain}-${h.symbol}`} className="flex items-center gap-3 px-5 py-3">
                <TokenWithChain symbol={h.symbol} chain={h.chain} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{TOKEN_MAP[h.symbol].name}</div>
                  <div className="text-xs text-white/45">{CHAIN_MAP[h.chain].name} · {formatUsd(TOKEN_MAP[h.symbol].price)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm tabular">{formatUsd(h.usd)}</div>
                  <div className="text-xs text-white/45 tabular">{formatAmount(h.amount)} {h.symbol} · <Change value={TOKEN_MAP[h.symbol].change24h} className="font-normal" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Liquidity positions</h2>
              <Link href="/pools" className="text-xs text-brand-2 hover:underline">Browse pools</Link>
            </div>
            {positions.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/40">No positions. Add liquidity to start earning fees.</div>
            ) : (
              <div className="mt-3 space-y-2">
                {positions.map((p) => {
                  const pool = POOL_MAP[p.poolId];
                  return (
                    <button key={p.poolId} onClick={() => setActivePool(pool)} className="w-full flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 p-3 text-left transition">
                      <span className="flex -space-x-2"><TokenIcon symbol={pool.token0} size={28} /><TokenIcon symbol={pool.token1} size={28} className="ring-2 ring-surface" /></span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{pool.token0}/{pool.token1} <span className="text-white/40 text-xs">{pool.feeTier}%</span></div>
                        <div className="text-xs text-white/45 flex items-center gap-1"><ChainIcon chain={pool.chain} size={11} bordered={false} /> {CHAIN_MAP[pool.chain].name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm tabular">{formatUsd(p.liquidityUsd)}</div>
                        <div className="text-xs text-up tabular">{pool.apr.toFixed(2)}% APR</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-5">
            <h2 className="font-semibold flex items-center gap-2"><Star size={14} className="text-amber-300" /> Watchlist</h2>
            <div className="mt-3 space-y-1">
              {watchlist.map((s) => (
                <div key={s} className="flex items-center gap-3 py-1.5">
                  <TokenIcon symbol={s} size={28} />
                  <div className="flex-1 text-sm">{s} <span className="text-white/40 text-xs">{TOKEN_MAP[s].name}</span></div>
                  <div className="text-right text-sm tabular">{formatUsd(TOKEN_MAP[s].price)}</div>
                  <Change value={TOKEN_MAP[s].change24h} className="text-xs w-16 text-right" />
                </div>
              ))}
              {watchlist.length === 0 && <div className="text-sm text-white/40 py-4 text-center">Star tokens in the token selector to track them.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RecentActivity limit={12} />
      </div>
      <LiquidityModal pool={activePool} open={activePool !== null} onClose={() => setActivePool(null)} />
    </div>
  );
}

function Sparkline({ total }: { total: number }) {
  const series = priceSeries("portfolio", 60, 0.012, total);
  const min = Math.min(...series);
  const max = Math.max(...series);
  const W = 600;
  const H = 70;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * (H - 6) - 3}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pf" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#7c6cff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="pf-a" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7c6cff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#7c6cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pts.join(" L")} L${W},${H} L0,${H} Z`} fill="url(#pf-a)" />
      <path d={`M${pts.join(" L")}`} fill="none" stroke="url(#pf)" strokeWidth="2" />
    </svg>
  );
}
