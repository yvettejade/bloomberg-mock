"use client";

import { useEffect, useState } from "react";
import type { DayMover, MoversResponse } from "@/lib/client-types";
import {
  changeColorClass,
  fmtPct,
  fmtPrice,
  ticker,
} from "@/lib/format";

function MoverList({
  title,
  items,
  variant,
}: {
  title: string;
  items: DayMover[];
  variant: "up" | "down";
}) {
  return (
    <div className="flex-1">
      <h3
        className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
          variant === "up" ? "text-up" : "text-down"
        }`}
      >
        {title}
      </h3>
      <ul className="space-y-1">
        {items.length === 0 ? (
          <li className="text-xs text-muted">No data</li>
        ) : (
          items.map((m) => (
            <li
              key={m.security}
              className="flex items-center justify-between font-mono text-xs"
            >
              <span className="text-accent">{ticker(m.security)}</span>
              <span className={changeColorClass(m.changePct)}>
                {fmtPct(m.changePct)}
              </span>
              <span className="hidden text-muted sm:inline">
                {fmtPrice(m.prevClose)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function MoversPanel() {
  const [data, setData] = useState<MoversResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/movers?top=5")
        .then((res) => res.json())
        .then((json: MoversResponse) => {
          if (!cancelled) setData(json);
        })
        .catch(() => {
          if (!cancelled) setData(null);
        });
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="flex flex-col overflow-hidden rounded border border-border bg-panel">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
          Previous Day Movers
        </h2>
        {data?.date && (
          <p className="mt-0.5 text-[10px] text-muted">{data.date}</p>
        )}
      </div>

      <div className="flex flex-col gap-4 p-3 sm:flex-row">
        <MoverList title="Top Gainers" items={data?.winners ?? []} variant="up" />
        <MoverList title="Top Losers" items={data?.losers ?? []} variant="down" />
      </div>
    </section>
  );
}
