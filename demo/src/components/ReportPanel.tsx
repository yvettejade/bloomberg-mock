"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReportsResponse } from "@/lib/client-types";
import {
  changeColorClass,
  fmtDateTime,
  fmtPct,
  fmtPrice,
  ticker,
} from "@/lib/format";

const POLL_INTERVAL_MS = 30_000;

export function ReportPanel() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json: ReportsResponse) => setData(json))
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const runReport = async () => {
    setRunning(true);
    try {
      await fetch("/api/reports/run", { method: "POST" });
      load();
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="flex flex-col overflow-hidden rounded border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
            Scheduled Reports
          </h2>
          {data?.generatedAt && (
            <p className="mt-0.5 text-[10px] text-muted">
              Generated {fmtDateTime(data.generatedAt)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={runReport}
          disabled={running}
          className="rounded border border-border bg-panel-2 px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {running ? "Running…" : "Run Now"}
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-panel-2 text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Ticker</th>
              <th className="px-3 py-2 text-right font-medium">Open</th>
              <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">
                High
              </th>
              <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">
                Low
              </th>
              <th className="px-3 py-2 text-right font-medium">Close</th>
              <th className="hidden px-3 py-2 text-right font-medium md:table-cell">
                VWAP
              </th>
              <th className="hidden px-3 py-2 text-right font-medium lg:table-cell">
                Ticks
              </th>
              <th className="px-3 py-2 text-right font-medium">Δ%</th>
            </tr>
          </thead>
          <tbody>
            {!data?.rows?.length ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted">
                  No reports yet — click Run Now to generate
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr
                  key={row.security}
                  className="border-t border-border font-mono hover:bg-panel-2"
                >
                  <td className="px-3 py-1.5 font-semibold text-accent">
                    {ticker(row.security)}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {row.open_price != null ? fmtPrice(row.open_price) : "—"}
                  </td>
                  <td className="hidden px-3 py-1.5 text-right sm:table-cell">
                    {row.high_price != null ? fmtPrice(row.high_price) : "—"}
                  </td>
                  <td className="hidden px-3 py-1.5 text-right sm:table-cell">
                    {row.low_price != null ? fmtPrice(row.low_price) : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {row.close_price != null ? fmtPrice(row.close_price) : "—"}
                  </td>
                  <td className="hidden px-3 py-1.5 text-right md:table-cell">
                    {row.vwap != null ? fmtPrice(row.vwap) : "—"}
                  </td>
                  <td className="hidden px-3 py-1.5 text-right text-muted lg:table-cell">
                    {row.tick_count ?? "—"}
                  </td>
                  <td
                    className={`px-3 py-1.5 text-right ${
                      row.change_pct != null
                        ? changeColorClass(row.change_pct)
                        : "text-muted"
                    }`}
                  >
                    {row.change_pct != null ? fmtPct(row.change_pct) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
