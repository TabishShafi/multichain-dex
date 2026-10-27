"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import { CHAINS } from "@/lib/chains";
import type { ChainId } from "@/lib/types";
import { ChainIcon } from "./icons";
import { formatUsd } from "@/lib/format";

export function ChainSelector({ value, onChange, compact = false, filter, className }: { value: ChainId; onChange: (c: ChainId) => void; compact?: boolean; filter?: (id: ChainId) => boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chain = CHAINS.find((c) => c.id === value)!;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-medium",
          compact ? "px-2 py-1" : "px-3 py-2",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ChainIcon chain={value} size={compact ? 18 : 22} />
        {!compact && <span className="hidden sm:inline">{chain.name}</span>}
        {compact && <span className="text-xs">{chain.shortName}</span>}
        <ChevronDown size={14} className={clsx("text-white/50 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 glass-strong rounded-2xl p-2 animate-fade-up" role="listbox">
          <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-white/40">Select network</div>
          {CHAINS.filter((c) => !filter || filter(c.id)).map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === value}
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition", c.id === value ? "bg-white/10" : "hover:bg-white/5")}
            >
              <ChainIcon chain={c.id} size={28} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {c.name}
                  <span className="text-[10px] uppercase tracking-wider text-white/35 font-normal">{c.type === "solana" ? "SVM" : "EVM"}</span>
                </div>
                <div className="text-xs text-white/45 tabular">TVL {formatUsd(c.tvl, { compact: true })} · gas ~{formatUsd(c.gasUsd, { digits: 3 })}</div>
              </div>
              {c.id === value && <Check size={16} className="text-brand-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
