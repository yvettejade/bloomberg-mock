"use client";

import { useEffect, useMemo, useState } from "react";
import { useMarketStream } from "@/hooks/useMarketStream";
import { Header } from "@/components/Header";
import { TickerGrid } from "@/components/TickerGrid";
import { PriceChart } from "@/components/PriceChart";
import { ReportPanel } from "@/components/ReportPanel";

export default function Dashboard() {
  const { ticks, status, lastUpdate } = useMarketStream();
  const [selected, setSelected] = useState<string | null>(null);

  const tickList = useMemo(
    () => Object.values(ticks).sort((a, b) => a.security.localeCompare(b.security)),
    [ticks],
  );

  useEffect(() => {
    if (!selected && tickList.length > 0) {
      setSelected(tickList[0].security);
    }
  }, [selected, tickList]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        status={status}
        lastUpdate={lastUpdate}
        securityCount={tickList.length}
      />

      <main className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TickerGrid
            ticks={tickList}
            selected={selected}
            onSelect={setSelected}
          />
          <PriceChart
            security={selected}
            liveTick={selected ? ticks[selected] : undefined}
          />
        </div>

        <ReportPanel />
      </main>

      <footer className="border-t border-border bg-panel px-5 py-2 text-[11px] text-muted">
        Live feed: mock <span className="text-foreground">@glue42/bbg-market-data</span> ·
        Storage: <span className="text-foreground">SQLite</span> · Reporting:{" "}
        <span className="text-foreground">node-cron</span> · For demo / educational
        use only — not real market data.
      </footer>
    </div>
  );
}
