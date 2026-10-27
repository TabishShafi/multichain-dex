import Link from "next/link";
import { ArrowRight, Layers, Route, ShieldCheck, Zap } from "lucide-react";
import { CHAINS } from "@/lib/chains";
import { POOLS } from "@/lib/pools";
import { TOKENS } from "@/lib/tokens";
import { formatUsd } from "@/lib/format";
import { ChainIcon, TokenIcon } from "@/components/icons";
import { Change } from "@/components/ui";
import { LandingSwapPreview } from "@/components/LandingSwapPreview";

const FEATURES = [
  { icon: Layers, title: "8 chains, one balance", body: "EVM L1s, rollups and Solana in a single interface. Switch networks without switching apps." },
  { icon: Route, title: "Smart routing", body: "Multi-hop routing across fee tiers and canonical bridges finds the best execution for every trade." },
  { icon: Zap, title: "Cross-chain in one click", body: "Sell on Ethereum, receive on Base. Swap, bridge and swap again in a single confirmed intent." },
  { icon: ShieldCheck, title: "Non-custodial by design", body: "Your keys stay in your wallet. Prism never holds funds, only routes them." },
];

export default function Home() {
  const tvl = CHAINS.reduce((s, c) => s + c.tvl, 0);
  const vol = CHAINS.reduce((s, c) => s + c.volume24h, 0);
  const movers = [...TOKENS].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 8);

  return (
    <div>
      <section className="pt-16 sm:pt-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1.5 pr-3 py-1 text-xs text-white/70">
            <span className="flex -space-x-1.5">
              {CHAINS.slice(0, 5).map((c) => (
                <ChainIcon key={c.id} chain={c.id} size={18} className="ring-2 ring-bg" />
              ))}
            </span>
            Now live on {CHAINS.length} networks
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]">
            Trade across <span className="text-gradient">every chain</span> like it&apos;s one.
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-xl">
            Prism is a multi-chain decentralized exchange. Swap, bridge and provide liquidity on Ethereum, Arbitrum, Base, Solana and more — with one wallet and one interface.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/swap" className="btn-primary rounded-full px-6 py-3 font-semibold flex items-center gap-2">
              Launch app <ArrowRight size={16} />
            </Link>
            <Link href="/pools" className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold transition">
              Explore pools
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { l: "Total value locked", v: formatUsd(tvl, { compact: true }) },
              { l: "24h volume", v: formatUsd(vol, { compact: true }) },
              { l: "Liquidity pools", v: POOLS.length.toString() },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-semibold tabular">{s.v}</div>
                <div className="text-xs text-white/45 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:120ms] lg:justify-self-end w-full max-w-md">
          <LandingSwapPreview />
        </div>
      </section>

      <section className="mt-20 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent z-10" />
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {[...movers, ...movers].map((t, i) => (
            <div key={`${t.symbol}-${i}`} className="flex items-center gap-3 rounded-full glass pl-1.5 pr-4 py-1.5 shrink-0">
              <TokenIcon symbol={t.symbol} size={28} />
              <span className="text-sm font-medium">{t.symbol}</span>
              <span className="text-sm text-white/60 tabular">{formatUsd(t.price)}</span>
              <Change value={t.change24h} className="text-xs" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="glass rounded-3xl p-6 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand/30 to-brand-2/20 grid place-items-center">
              <f.icon size={18} className="text-brand-2" />
            </div>
            <h3 className="mt-5 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Liquidity on every network</h2>
            <p className="text-white/55 mt-2">Deepest pools per chain, updated live in the app.</p>
          </div>
          <Link href="/pools" className="hidden sm:flex items-center gap-1 text-sm text-brand-2 hover:underline">
            All pools <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHAINS.map((c) => {
            const top = POOLS.filter((p) => p.chain === c.id).sort((a, b) => b.tvl - a.tvl)[0];
            return (
              <div key={c.id} className="glass rounded-3xl p-5 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition" style={{ background: c.color }} />
                <div className="relative flex items-center gap-3">
                  <ChainIcon chain={c.id} size={36} />
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-white/45">{c.type === "solana" ? "SVM" : "EVM"} · {c.avgBlockTime}s blocks</div>
                  </div>
                </div>
                <div className="relative mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-white/45">TVL</div>
                    <div className="tabular font-medium mt-0.5">{formatUsd(c.tvl, { compact: true })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/45">24h volume</div>
                    <div className="tabular font-medium mt-0.5">{formatUsd(c.volume24h, { compact: true })}</div>
                  </div>
                </div>
                {top && (
                  <div className="relative mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="flex -space-x-1.5">
                        <TokenIcon symbol={top.token0} size={18} />
                        <TokenIcon symbol={top.token1} size={18} />
                      </span>
                      {top.token0}/{top.token1}
                    </span>
                    <span className="text-up tabular">{top.apr.toFixed(1)}% APR</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-24 glass rounded-[2rem] p-10 sm:p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,108,255,0.25),transparent_60%)]" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready to trade without borders?</h2>
          <p className="mt-3 text-white/55 max-w-lg mx-auto">Connect a demo wallet pre-funded on all {CHAINS.length} chains and try cross-chain swaps instantly. No real assets involved.</p>
          <Link href="/swap" className="btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold">
            Open Prism <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
