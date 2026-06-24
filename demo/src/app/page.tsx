"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { MoversPanel } from "@/components/MoversPanel";
import { PriceChart } from "@/components/PriceChart";
import { ReportPanel } from "@/components/ReportPanel";
import { TickerGrid } from "@/components/TickerGrid";
import { useMarketStream } from "@/hooks/useMarketStream";

export default function Home() {
  const { tickList, ticks, status, lastTickTs, count } = useMarketStream();
  const [selected, setSelected] = useState<string | null>(null);

  const activeSecurity = selected ?? tickList[0]?.security ?? null;
  const liveTick = activeSecurity ? (ticks[activeSecurity] ?? null) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header status={status} lastTickTs={lastTickTs} count={count} />

      <main className="flex flex-1 flex-col gap-3 p-3 lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:gap-3">
        <div className="lg:col-span-7">
          <TickerGrid
            ticks={tickList}
            selected={activeSecurity}
            onSelect={setSelected}
          />
        </div>

        <div className="min-h-[280px] lg:col-span-5 lg:row-span-2">
          <PriceChart
            key={activeSecurity ?? "none"}
            security={activeSecurity}
            liveTick={liveTick}
            currency={liveTick?.currency}
          />
        </div>

        <div className="lg:col-span-7">
          <MoversPanel />
        </div>

        <div className="lg:col-span-12">
          <ReportPanel />
        </div>
      </main>

      <footer className="border-t border-border bg-panel px-4 py-2 text-center text-[10px] text-muted">
        demo / educational use only — not real market data
      </footer>
    </div>
  );
}
