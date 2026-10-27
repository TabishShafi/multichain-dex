"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { priceSeries } from "@/lib/random";
import { spotPrice } from "@/lib/pricing";
import { formatAmount, formatPct } from "@/lib/format";
import { TokenIcon } from "./icons";
import { Change } from "./ui";

const RANGES = [
  { key: "1H", points: 60, vol: 0.0015 },
  { key: "1D", points: 96, vol: 0.006 },
  { key: "1W", points: 84, vol: 0.014 },
  { key: "1M", points: 90, vol: 0.022 },
  { key: "1Y", points: 120, vol: 0.05 },
] as const;

export function PriceChart({ base, quote, className }: { base: string; quote: string; className?: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("1D");
  const [hover, setHover] = useState<number | null>(null);
  const r = RANGES.find((x) => x.key === range)!;
  const price = spotPrice(base, quote);

  const series = useMemo(() => priceSeries(`${base}/${quote}:${range}`, r.points, r.vol, price), [base, quote, range, r.points, r.vol, price]);
  const W = 640;
  const H = 220;
  const PAD = 8;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => [PAD + (i / (series.length - 1)) * (W - PAD * 2), PAD + (1 - (v - min) / span) * (H - PAD * 2)] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
  const first = series[0];
  const shown = hover !== null ? series[hover] : price;
  const change = ((shown - first) / first) * 100;
  const up = change >= 0;
  const color = up ? "#34d399" : "#fb7185";
  const gid = `g-${base}-${quote}`.replace(/[^a-z0-9-]/gi, "");

  return (
    <div className={clsx("glass rounded-3xl p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex -space-x-2">
              <TokenIcon symbol={base} size={26} />
              <TokenIcon symbol={quote} size={26} className="ring-2 ring-surface" />
            </span>
            <span className="font-medium">
              {base} / {quote}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular">{formatAmount(shown, shown < 1 ? 6 : 2)}</span>
            <span className="text-sm text-white/50">{quote}</span>
            <Change value={change} className="text-sm" />
          </div>
        </div>
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {RANGES.map((x) => (
            <button key={x.key} onClick={() => setRange(x.key)} className={clsx("px-2.5 py-1 rounded-full text-xs font-medium transition", range === x.key ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}>
              {x.key}
            </button>
          ))}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto mt-4 overflow-visible"
        preserveAspectRatio="none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round(((x - PAD) / (W - PAD * 2)) * (series.length - 1));
          setHover(Math.max(0, Math.min(series.length - 1, idx)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={0} y2={H} stroke="rgba(255,255,255,0.25)" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r={5} fill={color} stroke="#070812" strokeWidth={2} />
          </g>
        )}
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-white/50">
        <div>
          <div>Low</div>
          <div className="text-white tabular mt-0.5">{formatAmount(min, min < 1 ? 6 : 2)}</div>
        </div>
        <div>
          <div>High</div>
          <div className="text-white tabular mt-0.5">{formatAmount(max, max < 1 ? 6 : 2)}</div>
        </div>
        <div>
          <div>Range</div>
          <div className="text-white tabular mt-0.5">{formatPct(((max - min) / min) * 100)}</div>
        </div>
      </div>
    </div>
  );
}
