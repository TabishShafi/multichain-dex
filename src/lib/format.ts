export function formatUsd(value: number, opts: { compact?: boolean; digits?: number } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const { compact = false, digits } = opts;
  if (compact) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(value);
  }
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.01 && digits === undefined) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumSignificantDigits: 3 }).format(value);
  }
  const maxDigits = digits ?? (abs < 1 ? 4 : 2);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: maxDigits }).format(value);
}

export function formatAmount(value: number, maxDigits?: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  let digits = maxDigits;
  if (digits === undefined) {
    if (abs >= 10000) digits = 2;
    else if (abs >= 1) digits = 4;
    else if (abs >= 0.0001) digits = 6;
    else digits = 10;
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function formatPct(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function shortAddress(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function timeAgo(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
