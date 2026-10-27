import { CHAINS } from "@/lib/chains";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/60 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-up shadow-[0_0_12px_#34d399]" />
          Prototype — all chains, balances and transactions are simulated locally. No real funds.
        </div>
        <div className="flex items-center gap-3">
          <span>Supporting</span>
          <div className="flex -space-x-1.5">
            {CHAINS.map((c) => (
              <span key={c.id} className="h-4 w-4 rounded-full ring-2 ring-bg" style={{ background: c.color }} title={c.name} />
            ))}
          </div>
          <span>{CHAINS.length} chains</span>
        </div>
      </div>
    </footer>
  );
}
