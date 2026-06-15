"use client";

import { useEffect, useState } from "react";
import type { DayMover, MoversResponse } from "@/lib/client-types";
import { fmtPct, fmtPrice, ticker } from "@/lib/format";

function MoverRow({ m }: { m: DayMover }) {
  const up = m.changePct >= 0;
  return (
    <li className="flex items-center justify-between px-4 py-2 border-b border-border/50">
      <div className="min-w-0">
        <div className="font-mono text-sm font-semibold">{ticker(m.security)}</div>
        <div className="truncate text-[11px] text-muted">{m.name}</div>
      </div>
      <div className="flex items-center gap-4 text-right">
        <span className="font-mono tabular-nums text-sm text-muted">
          {fmtPrice(m.prevClose)}
        </span>
        <span
          className={`w-20 font-mono tabular-nums text-sm font-semibold ${
            up ? "text-up" : "text-down"
          }`}
        >
          {fmtPct(m.changePct)}
        </span>
      </div>
    </li>
  );
}

export function MoversPanel() {
  const [data, setData] = useState<MoversResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/movers?top=5")
      .then((r) => r.json())
      .then((d: MoversResponse) => {
        if (active) setData(d);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-lg border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Previous Day · Winners & Losers
          </h2>
          <p className="text-[11px] text-muted">
            day-over-day close · {data?.date ?? "—"}
          </p>
        </div>
        <span className="text-[11px] text-muted">Prev Close · Δ%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-border">
        <div>
          <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-up">
            Top Gainers
          </div>
          <ul>
            {data?.winners.length ? (
              data.winners.map((m) => <MoverRow key={m.security} m={m} />)
            ) : (
              <li className="px-4 py-3 text-sm text-muted">No gainers.</li>
            )}
          </ul>
        </div>
        <div>
          <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-down">
            Top Losers
          </div>
          <ul>
            {data?.losers.length ? (
              data.losers.map((m) => <MoverRow key={m.security} m={m} />)
            ) : (
              <li className="px-4 py-3 text-sm text-muted">No losers.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
