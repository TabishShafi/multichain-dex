"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, Settings2, ChevronDown, Info, Fuel, Clock, AlertTriangle, Zap } from "lucide-react";
import clsx from "clsx";
import { useDexStore } from "@/store/useDexStore";
import { getQuote, spotPrice } from "@/lib/pricing";
import { TOKEN_MAP, tokensOnChain, usdValue } from "@/lib/tokens";
import type { ChainId, Quote } from "@/lib/types";
import { formatAmount, formatUsd } from "@/lib/format";
import { TokenIcon, TokenWithChain } from "./icons";
import { ChainSelector } from "./ChainSelector";
import { TokenSelectModal } from "./TokenSelectModal";
import { RouteVisualizer } from "./RouteVisualizer";
import { Modal } from "./ui";
import { CHAIN_MAP } from "@/lib/chains";

type Side = "in" | "out";

function defaultTokens(chain: ChainId): [string, string] {
  const native = CHAIN_MAP[chain].nativeSymbol;
  const list = tokensOnChain(chain);
  const a = list.some((t) => t.symbol === native) ? native : list[0].symbol;
  const b = list.some((t) => t.symbol === "USDC") && a !== "USDC" ? "USDC" : list.find((t) => t.symbol !== a)!.symbol;
  return [a, b];
}

export function SwapCard({ mode = "swap", onPairChange }: { mode?: "swap" | "bridge"; onPairChange?: (base: string, quote: string) => void }) {
  const { selectedChain, setChain, slippage, setSlippage, balances, connected, connect, executeSwap, hydrated } = useDexStore();
  const [chainIn, setChainIn] = useState<ChainId>(selectedChain);
  const [chainOut, setChainOut] = useState<ChainId>(mode === "bridge" ? (selectedChain === "arbitrum" ? "base" : "arbitrum") : selectedChain);
  const [[tokenIn, tokenOut], setPair] = useState<[string, string]>(() => {
    const [a, b] = defaultTokens(selectedChain);
    return mode === "bridge" ? [b, b] : [a, b];
  });
  const [amountStr, setAmountStr] = useState("");
  const [selecting, setSelecting] = useState<Side | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [syncedChain, setSyncedChain] = useState<ChainId | null>(null);
  if (hydrated && syncedChain !== selectedChain) {
    setSyncedChain(selectedChain);
    if (syncedChain !== null) {
      setChainIn(selectedChain);
      if (mode === "swap") {
        setChainOut(selectedChain);
        setPair(defaultTokens(selectedChain));
      } else {
        const nextOut = chainOut === selectedChain ? (selectedChain === "arbitrum" ? "base" : "arbitrum") : chainOut;
        const bridgeable = tokensOnChain(selectedChain).find((t) => t.chains.includes(nextOut) && t.category === "stable")?.symbol ?? "USDC";
        setPair([bridgeable, bridgeable]);
        setChainOut(nextOut);
      }
    }
  }

  useEffect(() => {
    onPairChange?.(tokenIn, tokenOut);
  }, [tokenIn, tokenOut, onPairChange]);

  const amountIn = Number.parseFloat(amountStr.replace(/,/g, "")) || 0;
  const balanceIn = balances[chainIn]?.[tokenIn] ?? 0;
  const balanceOut = balances[chainOut]?.[tokenOut] ?? 0;
  const quote: Quote | null = useMemo(() => getQuote({ tokenIn, tokenOut, chainIn, chainOut, amountIn, slippagePct: slippage }), [tokenIn, tokenOut, chainIn, chainOut, amountIn, slippage]);
  const insufficient = connected && amountIn > balanceIn;
  const noRoute = amountIn > 0 && !quote;
  const highImpact = (quote?.priceImpact ?? 0) > 3;

  const flip = () => {
    setPair([tokenOut, tokenIn]);
    setChainIn(chainOut);
    setChainOut(chainIn);
    if (quote) setAmountStr(formatAmount(quote.amountOut, 6).replace(/,/g, ""));
  };

  const changeChainIn = (c: ChainId) => {
    setChainIn(c);
    if (mode === "swap") {
      setChain(c);
      return;
    }
    if (!TOKEN_MAP[tokenIn].chains.includes(c)) {
      const t = tokensOnChain(c).find((x) => x.chains.includes(chainOut))?.symbol ?? "USDC";
      setPair([t, t]);
    }
  };

  const changeChainOut = (c: ChainId) => {
    setChainOut(c);
    if (!TOKEN_MAP[tokenOut].chains.includes(c)) {
      const t = mode === "bridge" ? (TOKEN_MAP[tokenIn].chains.includes(c) ? tokenIn : "USDC") : CHAIN_MAP[c].nativeSymbol;
      setPair(mode === "bridge" ? [t, t] : [tokenIn, t]);
    }
  };

  const selectToken = (symbol: string) => {
    if (mode === "bridge") {
      setPair([symbol, symbol]);
      return;
    }
    if (selecting === "in") setPair([symbol, symbol === tokenOut ? tokenIn : tokenOut]);
    else setPair([symbol === tokenIn ? tokenOut : tokenIn, symbol]);
  };

  const submit = () => {
    if (!quote) return;
    setSubmitting(true);
    setTimeout(() => {
      executeSwap(quote);
      setSubmitting(false);
      setConfirmOpen(false);
      setAmountStr("");
    }, 900);
  };

  const cta = !hydrated
    ? { label: "Loading…", disabled: true }
    : !connected
      ? { label: "Connect wallet", disabled: false, action: connect }
      : amountIn <= 0
        ? { label: "Enter an amount", disabled: true }
        : noRoute
          ? { label: "No route found", disabled: true }
          : insufficient
            ? { label: `Insufficient ${tokenIn} balance`, disabled: true }
            : { label: mode === "bridge" ? "Bridge" : quote?.crossChain ? "Swap cross-chain" : "Swap", disabled: false, action: () => setConfirmOpen(true) };

  const rate = quote && quote.amountIn > 0 ? quote.amountOut / quote.amountIn : spotPrice(tokenIn, tokenOut);

  return (
    <div className="glass-strong rounded-3xl p-4 sm:p-5 w-full relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold">{mode === "bridge" ? "Bridge" : "Swap"}</h1>
          {quote?.crossChain && mode === "swap" && (
            <span className="text-[10px] uppercase tracking-wider rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-brand-2">cross-chain</span>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setSettingsOpen((o) => !o)} className={clsx("h-8 px-2.5 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/10 transition", settingsOpen && "bg-white/10 text-white")} aria-label="Settings">
            <span className="flex items-center gap-1.5 text-xs">
              <Settings2 size={15} /> {slippage}%
            </span>
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-72 glass-strong rounded-2xl p-4 z-30 animate-fade-up">
              <div className="text-xs font-medium flex items-center gap-1.5">
                Max slippage <Info size={12} className="text-white/40" />
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0.1, 0.5, 1].map((p) => (
                  <button key={p} onClick={() => setSlippage(p)} className={clsx("flex-1 rounded-lg py-1.5 text-xs border transition", slippage === p ? "border-brand/50 bg-brand/15" : "border-white/10 hover:bg-white/5")}>
                    {p}%
                  </button>
                ))}
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value) || 0.1)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 py-1.5 pl-2 pr-5 text-xs tabular outline-none focus:border-brand/60"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40">%</span>
                </div>
              </div>
              {slippage > 2 && <div className="mt-2 text-[11px] text-amber-300 flex items-center gap-1"><AlertTriangle size={11} /> High slippage — your trade may be front-run.</div>}
              <div className="mt-3 text-xs text-white/50">Transaction deadline: 20 min</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <AmountBox
          label={mode === "bridge" ? "From" : "Sell"}
          chain={chainIn}
          onChain={changeChainIn}
          token={tokenIn}
          onToken={() => setSelecting("in")}
          amount={amountStr}
          onAmount={setAmountStr}
          balance={balanceIn}
          showMax
          usd={usdValue(tokenIn, amountIn)}
          chainFilter={mode === "bridge" ? (c) => c !== chainOut : undefined}
        />
        <div className="relative h-2">
          <button
            onClick={flip}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-xl grid place-items-center bg-surface-2 border border-white/10 hover:border-brand/60 hover:text-brand-2 transition active:rotate-180 duration-300 z-10"
            aria-label="Flip tokens"
          >
            <ArrowDown size={16} />
          </button>
        </div>
        <AmountBox
          label={mode === "bridge" ? "To" : "Buy"}
          chain={chainOut}
          onChain={changeChainOut}
          token={tokenOut}
          onToken={mode === "bridge" ? undefined : () => setSelecting("out")}
          amount={quote ? formatAmount(quote.amountOut, 6) : ""}
          readOnly
          balance={balanceOut}
          usd={quote ? usdValue(tokenOut, quote.amountOut) : 0}
          usdDelta={quote ? usdValue(tokenOut, quote.amountOut) - usdValue(tokenIn, amountIn) : undefined}
          chainFilter={mode === "bridge" ? (c) => c !== chainIn && TOKEN_MAP[tokenIn].chains.includes(c) : undefined}
        />
      </div>

      {quote && (
        <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] text-xs">
          <details className="group" open>
            <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer list-none select-none">
              <span className="tabular text-white/80">
                1 {tokenIn} = {formatAmount(rate, rate < 1 ? 6 : 4)} {tokenOut} <span className="text-white/40">({formatUsd(TOKEN_MAP[tokenIn].price)})</span>
              </span>
              <span className="flex items-center gap-3 text-white/50">
                <span className="flex items-center gap-1"><Fuel size={12} /> {formatUsd(quote.gasUsd, { digits: 3 })}</span>
                <ChevronDown size={14} className="group-open:rotate-180 transition" />
              </span>
            </summary>
            <div className="px-3.5 pb-3 space-y-2 border-t border-white/5 pt-3">
              <Row label="Price impact" value={<span className={clsx(highImpact ? "text-down" : quote.priceImpact > 1 ? "text-amber-300" : "text-up")}>{quote.priceImpact < 0.01 ? "<0.01" : quote.priceImpact.toFixed(2)}%</span>} />
              <Row label={`Min. received (${slippage}% slippage)`} value={`${formatAmount(quote.minReceived, 6)} ${tokenOut}`} />
              <Row label="Liquidity provider fee" value={formatUsd(quote.feeUsd, { digits: 4 })} />
              {quote.crossChain && <Row label="Bridge fee" value={formatUsd(quote.bridgeFeeUsd, { digits: 4 })} />}
              <Row label="Network cost" value={formatUsd(quote.gasUsd, { digits: 3 })} />
              <Row label="Estimated time" value={<span className="flex items-center gap-1"><Clock size={11} /> {quote.estimatedSeconds < 60 ? `~${Math.round(quote.estimatedSeconds)}s` : `~${Math.round(quote.estimatedSeconds / 60)} min`}</span>} />
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-white/50 mb-2"><Zap size={11} className="text-brand-2" /> Best route via Prism router</div>
                <RouteVisualizer quote={quote} />
              </div>
            </div>
          </details>
        </div>
      )}

      {highImpact && quote && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-down/30 bg-down/10 px-3 py-2 text-xs text-down">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Price impact of {quote.priceImpact.toFixed(2)}% is high for this pool size. Consider splitting the order.
        </div>
      )}

      <button onClick={cta.action} disabled={cta.disabled} className={clsx("btn-primary mt-3 w-full rounded-2xl py-3.5 text-base font-semibold", highImpact && !cta.disabled && "!bg-[linear-gradient(135deg,#fb7185,#f43f5e)]")}>
        {cta.label}
      </button>

      <TokenSelectModal
        open={selecting !== null}
        onClose={() => setSelecting(null)}
        chain={selecting === "out" ? chainOut : chainIn}
        onChainChange={mode === "swap" ? (c) => (selecting === "out" ? changeChainOut(c) : changeChainIn(c)) : undefined}
        onSelect={selectToken}
        exclude={mode === "swap" && chainIn === chainOut ? (selecting === "in" ? tokenOut : tokenIn) : undefined}
      />

      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title={quote?.crossChain ? "Review cross-chain swap" : "Review swap"}>
        {quote && (
          <div>
            <div className="rounded-2xl bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50">You pay</div>
                  <div className="text-xl font-semibold tabular">{formatAmount(quote.amountIn, 6)} {tokenIn}</div>
                  <div className="text-xs text-white/40 tabular">{formatUsd(usdValue(tokenIn, quote.amountIn))} · {CHAIN_MAP[chainIn].name}</div>
                </div>
                <TokenWithChain symbol={tokenIn} chain={chainIn} size={40} />
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50">You receive</div>
                  <div className="text-xl font-semibold tabular">{formatAmount(quote.amountOut, 6)} {tokenOut}</div>
                  <div className="text-xs text-white/40 tabular">{formatUsd(usdValue(tokenOut, quote.amountOut))} · {CHAIN_MAP[chainOut].name}</div>
                </div>
                <TokenWithChain symbol={tokenOut} chain={chainOut} size={40} />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <Row label="Rate" value={`1 ${tokenIn} = ${formatAmount(rate, rate < 1 ? 6 : 4)} ${tokenOut}`} />
              <Row label="Min. received" value={`${formatAmount(quote.minReceived, 6)} ${tokenOut}`} />
              <Row label="Price impact" value={`${quote.priceImpact.toFixed(2)}%`} />
              <Row label="Total fees" value={formatUsd(quote.feeUsd + quote.gasUsd + quote.bridgeFeeUsd, { digits: 3 })} />
            </div>
            <div className="mt-4">
              <RouteVisualizer quote={quote} />
            </div>
            <button onClick={submit} disabled={submitting} className="btn-primary mt-5 w-full rounded-2xl py-3.5 font-semibold">
              {submitting ? "Signing in wallet…" : `Confirm ${mode === "bridge" ? "bridge" : "swap"}`}
            </button>
            <p className="mt-2 text-center text-[11px] text-white/35">Simulated transaction — no real assets move.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/50">{label}</span>
      <span className="tabular text-white/90">{value}</span>
    </div>
  );
}

function AmountBox({
  label, chain, onChain, token, onToken, amount, onAmount, readOnly, balance, showMax, usd, usdDelta, chainFilter,
}: {
  label: string;
  chain: ChainId;
  onChain: (c: ChainId) => void;
  token: string;
  onToken?: () => void;
  amount: string;
  onAmount?: (v: string) => void;
  readOnly?: boolean;
  balance: number;
  showMax?: boolean;
  usd: number;
  usdDelta?: number;
  chainFilter?: (c: ChainId) => boolean;
}) {
  const { connected } = useDexStore();
  return (
    <div className={clsx("rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition", !readOnly && "focus-within:border-brand/50 focus-within:bg-white/[0.05]")}>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <ChainSelector value={chain} onChange={onChain} compact filter={chainFilter} />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <input
          inputMode="decimal"
          placeholder="0"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            if ((v.match(/\./g) ?? []).length <= 1) onAmount?.(v);
          }}
          className={clsx("flex-1 min-w-0 bg-transparent text-3xl font-medium tabular outline-none placeholder:text-white/25", readOnly && "text-white/80")}
        />
        <button
          onClick={onToken}
          disabled={!onToken}
          className={clsx("flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1.5 pr-2.5 py-1.5 text-sm font-semibold transition shrink-0", onToken && "hover:bg-white/10 hover:border-white/20")}
        >
          <TokenIcon symbol={token} size={26} />
          {token}
          {onToken && <ChevronDown size={14} className="text-white/50" />}
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-white/45 tabular">
        <span>
          {usd > 0 ? formatUsd(usd) : "$0.00"}
          {usdDelta !== undefined && usd > 0 && <span className={clsx("ml-1", usdDelta < 0 ? "text-white/40" : "text-up")}>({usdDelta >= 0 ? "+" : ""}{formatUsd(usdDelta)})</span>}
        </span>
        <span className="flex items-center gap-1.5">
          {connected ? `Balance: ${formatAmount(balance)}` : "—"}
          {showMax && connected && balance > 0 && onAmount && (
            <button onClick={() => onAmount(String(balance))} className="rounded-md bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-2 hover:bg-brand/30">MAX</button>
          )}
        </span>
      </div>
    </div>
  );
}
