"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet, LogOut, Copy, Check, RotateCcw, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { useDexStore } from "@/store/useDexStore";
import { shortAddress, formatUsd } from "@/lib/format";
import { CHAINS, CHAIN_MAP } from "@/lib/chains";
import { usdValue } from "@/lib/tokens";

export function WalletButton() {
  const { connected, address, solanaAddress, connect, disconnect, balances, selectedChain, resetDemo, hydrated } = useDexStore();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!hydrated) return <div className="h-9 w-32 rounded-full shimmer-bg" />;

  if (!connected || !address) {
    return (
      <button onClick={connect} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2">
        <Wallet size={16} />
        Connect wallet
      </button>
    );
  }

  const total = CHAINS.reduce((sum, c) => sum + Object.entries(balances[c.id] ?? {}).reduce((s, [sym, amt]) => s + usdValue(sym, amt), 0), 0);
  const displayAddr = CHAIN_MAP[selectedChain].type === "solana" && solanaAddress ? solanaAddress : address;

  const copy = () => {
    navigator.clipboard?.writeText(displayAddr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition pl-1.5 pr-3 py-1.5 text-sm font-medium">
        <span className="h-6 w-6 rounded-full bg-[conic-gradient(from_180deg,#7c6cff,#22d3ee,#ff007a,#7c6cff)] ring-1 ring-white/20" />
        <span className="hidden sm:inline tabular">{formatUsd(total, { compact: true })}</span>
        <span className="font-mono text-xs text-white/70">{shortAddress(displayAddr)}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 glass-strong rounded-2xl p-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-[conic-gradient(from_180deg,#7c6cff,#22d3ee,#ff007a,#7c6cff)] ring-2 ring-white/10" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm truncate">{shortAddress(displayAddr, 6)}</div>
              <div className="text-xs text-white/45">Demo wallet · {CHAIN_MAP[selectedChain].name}</div>
            </div>
            <button onClick={copy} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10 text-white/60" aria-label="Copy address">
              {copied ? <Check size={14} className="text-up" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="mt-4 rounded-xl bg-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wider text-white/40">Total across {CHAINS.length} chains</div>
            <div className="text-2xl font-semibold tabular mt-1">{formatUsd(total)}</div>
          </div>
          <div className="mt-3 space-y-1 max-h-48 overflow-y-auto pr-1">
            {CHAINS.map((c) => {
              const v = Object.entries(balances[c.id] ?? {}).reduce((s, [sym, amt]) => s + usdValue(sym, amt), 0);
              return (
                <div key={c.id} className="flex items-center justify-between text-xs px-1 py-1">
                  <span className="flex items-center gap-2 text-white/70">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="tabular">{formatUsd(v)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href={`${CHAIN_MAP[selectedChain].explorer}/address/${displayAddr}`} target="_blank" rel="noreferrer" className={clsx("flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs hover:bg-white/5")}>
              <ExternalLink size={13} /> Explorer
            </a>
            <button onClick={resetDemo} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs hover:bg-white/5">
              <RotateCcw size={13} /> Reset demo
            </button>
          </div>
          <button onClick={() => { disconnect(); setOpen(false); }} className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-down hover:bg-down/10">
            <LogOut size={13} /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
