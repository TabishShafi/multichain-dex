"use client";

import { CheckCircle2, Loader2, AlertCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import { useDexStore } from "@/store/useDexStore";

export function TxToaster() {
  const { toasts, dismissToast } = useDexStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => (
        <div key={t.id} className="glass-strong rounded-2xl p-3.5 flex items-start gap-3 animate-fade-up">
          <span className={clsx("mt-0.5 shrink-0", t.kind === "success" && "text-up", t.kind === "error" && "text-down", t.kind === "pending" && "text-brand-2", t.kind === "info" && "text-white/60")}>
            {t.kind === "pending" && <Loader2 size={18} className="animate-spin" />}
            {t.kind === "success" && <CheckCircle2 size={18} />}
            {t.kind === "error" && <AlertCircle size={18} />}
            {t.kind === "info" && <Info size={18} />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{t.title}</div>
            {t.description && <div className="text-xs text-white/55 mt-0.5 truncate">{t.description}</div>}
            {t.kind === "pending" && (
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand to-brand-2 animate-[marquee_1.2s_linear_infinite_reverse]" />
              </div>
            )}
          </div>
          <button onClick={() => dismissToast(t.id)} className="text-white/40 hover:text-white" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
