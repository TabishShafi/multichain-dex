"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import clsx from "clsx";
import { Modal } from "./ui";
import { TokenIcon, ChainIcon } from "./icons";
import type { Pool } from "@/lib/types";
import { TOKEN_MAP, usdValue } from "@/lib/tokens";
import { formatAmount, formatUsd } from "@/lib/format";
import { useDexStore } from "@/store/useDexStore";
import { CHAIN_MAP } from "@/lib/chains";

export function LiquidityModal({ pool, open, onClose }: { pool: Pool | null; open: boolean; onClose: () => void }) {
  const { balances, connected, connect, addLiquidity, removeLiquidity, positions } = useDexStore();
  const [tab, setTab] = useState<"add" | "remove">("add");
  const [amount0Str, setAmount0] = useState("");
  const [pct, setPct] = useState(50);
  if (!pool) return null;

  const t0 = TOKEN_MAP[pool.token0];
  const t1 = TOKEN_MAP[pool.token1];
  const ratio = t0.price / t1.price;
  const amount0 = Number.parseFloat(amount0Str) || 0;
  const amount1 = amount0 * ratio;
  const bal0 = balances[pool.chain]?.[pool.token0] ?? 0;
  const bal1 = balances[pool.chain]?.[pool.token1] ?? 0;
  const insufficient = amount0 > bal0 || amount1 > bal1;
  const position = positions.find((p) => p.poolId === pool.id);
  const usd = usdValue(pool.token0, amount0) + usdValue(pool.token1, amount1);
  const share = usd / (pool.tvl + usd);
  const yearlyFees = (usd * pool.apr) / 100;

  const close = () => {
    setAmount0("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title={<span className="flex items-center gap-2"><span className="flex -space-x-2"><TokenIcon symbol={pool.token0} size={24} /><TokenIcon symbol={pool.token1} size={24} className="ring-2 ring-surface" /></span>{pool.token0}/{pool.token1} <span className="text-xs text-white/40 font-normal">{pool.feeTier}% · {CHAIN_MAP[pool.chain].name}</span></span>}>
      <div className="flex gap-1 rounded-xl bg-white/5 p-1 text-sm">
        {(["add", "remove"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx("flex-1 rounded-lg py-1.5 capitalize transition flex items-center justify-center gap-1.5", tab === t ? "bg-white/10 text-white" : "text-white/50")} disabled={t === "remove" && !position}>
            {t === "add" ? <Plus size={14} /> : <Minus size={14} />} {t} liquidity
          </button>
        ))}
      </div>

      {tab === "add" ? (
        <div className="mt-4 space-y-2">
          {[{ sym: pool.token0, amt: amount0Str, bal: bal0, editable: true }, { sym: pool.token1, amt: amount1 ? formatAmount(amount1, 6) : "", bal: bal1, editable: false }].map((r) => (
            <div key={r.sym} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
              <div className="flex items-center gap-3">
                <input
                  inputMode="decimal"
                  placeholder="0"
                  value={r.amt}
                  readOnly={!r.editable}
                  onChange={(e) => setAmount0(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="flex-1 min-w-0 bg-transparent text-2xl font-medium tabular outline-none placeholder:text-white/25"
                />
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1.5 pr-3 py-1.5 text-sm font-semibold"><TokenIcon symbol={r.sym} size={24} /> {r.sym}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/45 tabular">
                <span>{formatUsd(usdValue(r.sym, Number.parseFloat(String(r.amt).replace(/,/g, "")) || 0))}</span>
                <span className="flex items-center gap-1.5">
                  Balance: {formatAmount(r.bal)}
                  {r.editable && bal0 > 0 && <button onClick={() => setAmount0(String(Math.min(bal0, bal1 / ratio)))} className="rounded-md bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-2">MAX</button>}
                </span>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-white/5 p-3.5 text-xs space-y-2">
            <div className="flex justify-between"><span className="text-white/50">Pool share</span><span className="tabular">{(share * 100).toFixed(4)}%</span></div>
            <div className="flex justify-between"><span className="text-white/50">Est. yearly fees</span><span className="tabular text-up">{formatUsd(yearlyFees)} ({pool.apr.toFixed(2)}% APR)</span></div>
            <div className="flex justify-between"><span className="text-white/50">Network</span><span className="flex items-center gap-1.5"><ChainIcon chain={pool.chain} size={14} /> {CHAIN_MAP[pool.chain].name}</span></div>
          </div>
          {!connected ? (
            <button onClick={connect} className="btn-primary w-full rounded-2xl py-3.5 font-semibold">Connect wallet</button>
          ) : (
            <button
              disabled={amount0 <= 0 || insufficient}
              onClick={() => {
                addLiquidity(pool.id, amount0, amount1);
                close();
              }}
              className="btn-primary w-full rounded-2xl py-3.5 font-semibold"
            >
              {amount0 <= 0 ? "Enter an amount" : insufficient ? "Insufficient balance" : "Add liquidity"}
            </button>
          )}
        </div>
      ) : (
        position && (
          <div className="mt-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs text-white/50">Your position</div>
              <div className="text-2xl font-semibold tabular mt-1">{formatUsd(position.liquidityUsd)}</div>
              <div className="mt-5 text-5xl font-semibold tabular text-center">{pct}%</div>
              <input type="range" min={1} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="mt-3 w-full accent-[#7c6cff]" />
              <div className="mt-3 flex gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} onClick={() => setPct(p)} className={clsx("flex-1 rounded-lg py-1.5 text-xs border", pct === p ? "border-brand/50 bg-brand/15" : "border-white/10 hover:bg-white/5")}>{p === 100 ? "Max" : `${p}%`}</button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-white/5 p-3.5 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-white/50">You receive</span><span className="tabular">{formatAmount((position.liquidityUsd * pct) / 100 / 2 / t0.price)} {pool.token0}</span></div>
              <div className="flex justify-between"><span className="text-white/50"></span><span className="tabular">{formatAmount((position.liquidityUsd * pct) / 100 / 2 / t1.price)} {pool.token1}</span></div>
            </div>
            <button
              onClick={() => {
                removeLiquidity(pool.id, pct / 100);
                close();
              }}
              className="btn-primary mt-3 w-full rounded-2xl py-3.5 font-semibold"
            >
              Remove liquidity
            </button>
          </div>
        )
      )}
    </Modal>
  );
}
