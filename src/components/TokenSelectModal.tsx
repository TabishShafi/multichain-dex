"use client";

import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import clsx from "clsx";
import { Modal } from "./ui";
import { TokenIcon, ChainIcon } from "./icons";
import { tokensOnChain } from "@/lib/tokens";
import type { ChainId } from "@/lib/types";
import { CHAINS } from "@/lib/chains";
import { formatAmount, formatUsd } from "@/lib/format";
import { useDexStore } from "@/store/useDexStore";

const QUICK = ["ETH", "USDC", "USDT", "WBTC", "SOL"];

export function TokenSelectModal({
  open,
  onClose,
  chain,
  onChainChange,
  onSelect,
  exclude,
}: {
  open: boolean;
  onClose: () => void;
  chain: ChainId;
  onChainChange?: (c: ChainId) => void;
  onSelect: (symbol: string) => void;
  exclude?: string;
}) {
  const [query, setQuery] = useState("");
  const { balances, watchlist, toggleWatch } = useDexStore();

  const tokens = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokensOnChain(chain)
      .filter((t) => t.symbol !== exclude)
      .filter((t) => !q || t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      .map((t) => ({ ...t, balance: balances[chain]?.[t.symbol] ?? 0 }))
      .sort((a, b) => b.balance * b.price - a.balance * a.price || a.symbol.localeCompare(b.symbol));
  }, [chain, query, exclude, balances]);

  const pick = (symbol: string) => {
    onSelect(symbol);
    setQuery("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Select a token">
      {onChainChange && (
        <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 [scrollbar-width:none]">
          {CHAINS.map((c) => (
            <button
              key={c.id}
              onClick={() => onChainChange(c.id)}
              className={clsx("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs shrink-0 transition", c.id === chain ? "border-white/30 bg-white/10" : "border-white/10 hover:bg-white/5 text-white/60")}
            >
              <ChainIcon chain={c.id} size={16} bordered={false} />
              {c.shortName}
            </button>
          ))}
        </div>
      )}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or symbol"
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand/60 focus:bg-white/[0.07] transition"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {QUICK.filter((s) => tokens.some((t) => t.symbol === s)).map((s) => (
          <button key={s} onClick={() => pick(s)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 pl-1 pr-3 py-1 text-xs font-medium">
            <TokenIcon symbol={s} size={20} /> {s}
          </button>
        ))}
      </div>
      <div className="mt-3 -mx-2 max-h-[46vh] overflow-y-auto">
        {tokens.length === 0 && <div className="text-center text-sm text-white/40 py-10">No tokens on this chain match “{query}”</div>}
        {tokens.map((t) => (
          <div key={t.symbol} className="group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => pick(t.symbol)}>
            <TokenIcon symbol={t.symbol} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                {t.symbol}
                <span className="text-[10px] uppercase tracking-wider text-white/35 border border-white/10 rounded px-1">{t.category}</span>
              </div>
              <div className="text-xs text-white/45 truncate">{t.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm tabular">{t.balance > 0 ? formatAmount(t.balance) : <span className="text-white/30">0</span>}</div>
              <div className="text-xs text-white/45 tabular">{t.balance > 0 ? formatUsd(t.balance * t.price) : formatUsd(t.price)}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(t.symbol);
              }}
              className={clsx("h-7 w-7 grid place-items-center rounded-full transition", watchlist.includes(t.symbol) ? "text-amber-300" : "text-white/20 opacity-0 group-hover:opacity-100 hover:text-white")}
              aria-label="Toggle watchlist"
            >
              <Star size={14} fill={watchlist.includes(t.symbol) ? "currentColor" : "none"} />
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
