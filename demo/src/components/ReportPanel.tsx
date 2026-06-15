"use client";

import { useEffect, useState } from "react";
import type { ReportsResponse } from "@/lib/client-types";
import { fmtPct, fmtPrice, fmtTime, ticker } from "@/lib/format";

export function ReportPanel() {
  const [data, setData] = useState<ReportsResponse | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/reports")
        .then((r) => r.json())
        .then((d: ReportsResponse) => {
          if (active) setData(d);
        })
        .catch(() => undefined);
    };
    load();
    const id = setInterval(load, 5_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const rows = data?.rows ?? [];

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Scheduled Report
          </h2>
          <p className="text-[11px] text-muted">
            node-cron · SQL aggregation every 20s
          </p>
        </div>
        <div className="text-right text-[11px] text-muted">
          <div>GENERATED</div>
          <div className="font-mono text-foreground">
            {data?.generatedAt ? fmtTime(data.generatedAt) : "pending…"}
          </div>
        </div>
      </div>

      <div className="max-h-[60vh] flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-panel-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Ticker</th>
              <th className="px-3 py-2 text-right font-medium">Open</th>
              <th className="px-3 py-2 text-right font-medium">High</th>
              <th className="px-3 py-2 text-right font-medium">Low</th>
              <th className="px-3 py-2 text-right font-medium">Close</th>
              <th className="px-3 py-2 text-right font-medium">VWAP</th>
              <th className="px-3 py-2 text-right font-medium">Ticks</th>
              <th className="px-3 py-2 text-right font-medium">Δ%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.security} className="border-b border-border/50">
                <td className="px-3 py-2 font-mono font-semibold">
                  {ticker(r.security)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                  {fmtPrice(r.open_price)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {fmtPrice(r.high_price)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {fmtPrice(r.low_price)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold">
                  {fmtPrice(r.close_price)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                  {fmtPrice(r.vwap)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                  {r.tick_count ?? "—"}
                </td>
                <td
                  className={`px-3 py-2 text-right font-mono tabular-nums font-semibold ${
                    (r.change_pct ?? 0) >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {fmtPct(r.change_pct)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted">
                  First report runs within ~20s of startup…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
