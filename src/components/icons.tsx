import { getChain } from "@/lib/chains";
import { getToken } from "@/lib/tokens";
import type { ChainId } from "@/lib/types";
import clsx from "clsx";

function initials(symbol: string): string {
  return symbol.length <= 3 ? symbol : symbol.slice(0, 3);
}

export function TokenIcon({ symbol, size = 32, className }: { symbol: string; size?: number; className?: string }) {
  const token = getToken(symbol);
  const color = token?.color ?? "#888";
  return (
    <span
      className={clsx("inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ring-1 ring-white/10 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.6)]", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.32),
        background: `radial-gradient(circle at 30% 25%, ${color}ff, ${color}99 60%, #0b0d1a 140%)`,
        letterSpacing: "-0.02em",
      }}
      aria-label={symbol}
    >
      {initials(symbol)}
    </span>
  );
}

const CHAIN_GLYPHS: Record<ChainId, string> = {
  ethereum: "M12 2 5 12.4l7 4.1 7-4.1L12 2Zm0 20 7-9.9-7 4.1-7-4.1 7 9.9Z",
  arbitrum: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 3.2 5.8 3.3L12 11.8 6.2 8.5 12 5.2Zm-6 5.6 5 2.9v6.1l-5-2.8v-6.2Zm12 0v6.2l-5 2.8v-6.1l5-2.9Z",
  optimism: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3.1 7.1c1.7 0 2.6 1 2.4 2.7l-.3 1.6c-.3 1.5-1.4 2.4-3.1 2.4-1.7 0-2.6-1-2.3-2.7l.3-1.6c.2-1.5 1.3-2.4 3-2.4Zm6.4.1h2.5c1.6 0 2.5.9 2.3 2.2-.3 1.5-1.3 2.3-3 2.3h-1.1l-.3 2h-1.8l1.4-6.5Z",
  base: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-.4 3a7 7 0 0 1 6.9 6h-9.3v2h9.3a7 7 0 1 1-6.9-8Z",
  polygon: "m16.5 8.4-3.1-1.8a1 1 0 0 0-1 0L9.3 8.4l-2.1 1.2a1 1 0 0 0-.5.9v4.8a1 1 0 0 0 .5.9l3.1 1.8a1 1 0 0 0 1 0l2.1-1.2 2.1-1.2 2.1-1.2a1 1 0 0 0 .5-.9v-2.6l-2.1 1.2v1.6l-2.1 1.2-2.1 1.2-2.1-1.2v-2.4l2.1-1.2 2.1 1.2 2.1 1.2 2.1-1.2V9.3a1 1 0 0 0-.5-.9Z",
  bnb: "m12 2 2.9 2.9-5.9 5.9L6.1 7.9 12 2Zm4.6 4.6L19.5 9.5 12 17l-7.5-7.5 2.9-2.9L12 11.2l4.6-4.6ZM3.2 10.8l2.9 2.9-2.9 2.9-2.9-2.9 2.9-2.9Zm17.6 0 2.9 2.9-2.9 2.9-2.9-2.9 2.9-2.9ZM12 15.4l2.9 2.9L12 22l-2.9-3.7 2.9-2.9Z",
  avalanche: "M12 2 2 20h6.2l1.5-2.6L12 12.8l2.3 4.6L15.8 20H22L12 2Zm0 6.3L9.6 13 8 15.8l-.6 1H6.3L12 6.3l5.7 10.5h-1.1l-.6-1L14.4 13 12 8.3Z",
  solana: "M6.2 15.6a.6.6 0 0 1 .4-.2h13.7c.3 0 .4.3.2.5l-2.7 2.7a.6.6 0 0 1-.4.2H3.7c-.3 0-.4-.3-.2-.5l2.7-2.7Zm0-10.2a.6.6 0 0 1 .4-.2h13.7c.3 0 .4.3.2.5l-2.7 2.7a.6.6 0 0 1-.4.2H3.7c-.3 0-.4-.3-.2-.5l2.7-2.7Zm11.6 5.1a.6.6 0 0 0-.4-.2H3.7c-.3 0-.4.3-.2.5l2.7 2.7c.1.1.3.2.4.2h13.7c.3 0 .4-.3.2-.5l-2.7-2.7Z",
};

export function ChainIcon({ chain, size = 20, className, bordered = true }: { chain: ChainId; size?: number; className?: string; bordered?: boolean }) {
  const c = getChain(chain);
  return (
    <span
      className={clsx("inline-flex items-center justify-center rounded-full shrink-0", bordered && "ring-1 ring-white/15", className)}
      style={{ width: size, height: size, background: `linear-gradient(145deg, ${c.color}, ${c.color}aa)` }}
      aria-label={c.name}
      title={c.name}
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill={chain === "solana" ? "#0b0d1a" : "white"} fillRule="evenodd">
        <path d={CHAIN_GLYPHS[chain]} />
      </svg>
    </span>
  );
}

export function TokenWithChain({ symbol, chain, size = 36 }: { symbol: string; chain: ChainId; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <TokenIcon symbol={symbol} size={size} />
      <ChainIcon chain={chain} size={Math.round(size * 0.46)} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
    </span>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
        <defs>
          <linearGradient id="prism-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c7c2ff" />
            <stop offset="0.5" stopColor="#7c6cff" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M16 3 29 26H3L16 3Z" stroke="url(#prism-g)" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M16 11v15" stroke="url(#prism-g)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="m10 26 6-9 6 9" stroke="url(#prism-g)" strokeWidth="2.2" strokeLinejoin="round" opacity="0.6" />
      </svg>
    </span>
  );
}
