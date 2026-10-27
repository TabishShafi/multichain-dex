"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { useDexStore } from "@/store/useDexStore";
import type { Transaction } from "@/lib/types";
import { TokenWithChain } from "./icons";
import { formatAmount, shortHash, timeAgo } from "@/lib/format";
import { CHAIN_MAP } from "@/lib/chains";

const LABELS: Record<Transaction["type"], string> = {
  swap: "Swap",
  bridge: "Bridge",
  "add-liquidity": "Add liquidity",
  "remove-liquidity": "Remove liquidity",
};

export function RecentActivity({ limit = 10, filter, title = "Recent activity" }: { limit?: number; filter?: (t: Transaction) => boolean; title?: string }) {
  const transactions = useDexStore((s) => s.transactions);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const i = setInterval(tick, 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(i);
    };
  }, []);
  const list = transactions.filter((t) => !filter || filter(t)).slice(0, limit);

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-white/40">{list.length} shown</span>
      </div>
      {list.length === 0 ? (
        <div className="py-10 text-center text-sm text-white/40">No transactions yet. Your activity across all chains shows up here.</div>
      ) : (
        <div className="mt-3 divide-y divide-white/5">
          {list.map((t) => {
            const explorer = CHAIN_MAP[t.chain].explorer + "/tx/" + t.hash;
            return (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className="flex -space-x-3">
                  <TokenWithChain symbol={t.tokenIn} chain={t.chain} size={32} />
                  <TokenWithChain symbol={t.tokenOut} chain={t.toChain ?? t.chain} size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {LABELS[t.type]}
                    {t.toChain && <span className="text-[10px] uppercase tracking-wider text-brand-2 border border-brand/30 rounded px-1">{CHAIN_MAP[t.chain].shortName} → {CHAIN_MAP[t.toChain].shortName}</span>}
                  </div>
                  <div className="text-xs text-white/50 tabular flex items-center gap-1.5 truncate">
                    {formatAmount(t.amountIn)} {t.tokenIn} <ArrowRight size={10} /> {formatAmount(t.amountOut)} {t.tokenOut}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="flex items-center justify-end gap-1">
                    {t.status === "pending" ? <Loader2 size={12} className="animate-spin text-brand-2" /> : <CheckCircle2 size={12} className="text-up" />}
                    <span className={t.status === "pending" ? "text-brand-2" : "text-white/70"}>{t.status === "pending" ? "Pending" : "Confirmed"}</span>
                  </div>
                  <a href={explorer} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center justify-end gap-1 font-mono text-white/40 hover:text-white">
                    {shortHash(t.hash)} <ExternalLink size={10} />
                  </a>
                  <div className="text-white/35 mt-0.5">{timeAgo(t.timestamp, now)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
