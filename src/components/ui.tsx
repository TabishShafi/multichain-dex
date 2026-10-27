"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Modal({ open, onClose, title, children, width = "max-w-md" }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeUp_0.2s_ease_both]" onClick={onClose} />
      <div className={clsx("relative w-full glass-strong rounded-t-3xl sm:rounded-3xl p-5 animate-fade-up max-h-[90vh] flex flex-col", width)}>
        {title !== undefined && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">{title}</h2>
            <button onClick={onClose} className="h-8 w-8 rounded-full grid place-items-center text-white/50 hover:text-white hover:bg-white/10 transition" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto -mx-1 px-1">{children}</div>
      </div>
    </div>
  );
}

export function Pill({ children, className, active, onClick }: { children: ReactNode; className?: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-full text-xs font-medium transition border",
        active ? "bg-brand/20 border-brand/40 text-white" : "border-white/10 text-white/60 hover:text-white hover:bg-white/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: ReactNode; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="text-xs uppercase tracking-wider text-white/45">{label}</div>
      <div className={clsx("mt-2 text-2xl sm:text-3xl font-semibold tabular", accent && "text-gradient")}>{value}</div>
      {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
    </div>
  );
}

export function Change({ value, className }: { value: number; className?: string }) {
  const up = value >= 0;
  return (
    <span className={clsx("tabular font-medium", up ? "text-up" : "text-down", className)}>
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("rounded-lg shimmer-bg", className)} />;
}
