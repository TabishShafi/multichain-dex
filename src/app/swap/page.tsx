"use client";

import { useCallback, useState } from "react";
import { SwapCard } from "@/components/SwapCard";
import { PriceChart } from "@/components/PriceChart";
import { RecentActivity } from "@/components/RecentActivity";
import { useDexStore } from "@/store/useDexStore";

export default function SwapPage() {
  const [pair, setPair] = useState<[string, string]>(["ETH", "USDC"]);
  const onPairChange = useCallback((a: string, b: string) => setPair([a, b]), []);
  const hydrated = useDexStore((s) => s.hydrated);

  return (
    <div className="pt-8 sm:pt-12 grid lg:grid-cols-[1fr_440px] gap-6 items-start">
      <div className="order-2 lg:order-1 space-y-6 animate-fade-up [animation-delay:80ms]">
        <PriceChart base={pair[0]} quote={pair[1]} />
        <RecentActivity limit={6} />
      </div>
      <div className="order-1 lg:order-2 lg:sticky lg:top-24 animate-fade-up">
        {hydrated ? <SwapCard onPairChange={onPairChange} /> : <div className="glass-strong rounded-3xl h-[420px] shimmer-bg" />}
      </div>
    </div>
  );
}
