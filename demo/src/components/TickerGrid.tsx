"use client";

import type { LiveTick } from "@/lib/client-types";
import { fmtPct, fmtPrice, fmtVolume, ticker } from "@/lib/format";

export function TickerGrid({
  ticks,
  selected,
  onSelect,
}: {
  ticks: LiveTick[];
  selected: string | null;
  onSelect: (security: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Watchlist
        </h2>
        <span className="text-[11px] text-muted">{ticks.length} instruments</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-panel-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Ticker</th>
              <th className="px-3 py-2 text-left font-medium">Sector</th>
              <th className="px-3 py-2 text-right font-medium">Last</th>
              <th className="px-3 py-2 text-right font-medium">Bid</th>
              <th className="px-3 py-2 text-right font-medium">Ask</th>
              <th className="px-3 py-2 text-right font-medium">Chg%</th>
              <th className="px-3 py-2 text-right font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {ticks.map((tick) => {
              const up = tick.changePct >= 0;
              const isSelected = tick.security === selected;
              return (
                <tr
                  key={tick.security}
                  onClick={() => onSelect(tick.security)}
                  className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-panel-2 ${
                    isSelected ? "bg-panel-2" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="h-3 w-0.5 rounded bg-accent" />
                      )}
                      <span className="font-mono font-semibold">
                        {ticker(tick.security)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted">{tick.name}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{tick.sector}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold">
                    {fmtPrice(tick.lastPrice)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                    {fmtPrice(tick.bid)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                    {fmtPrice(tick.ask)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono tabular-nums font-semibold ${
                      up ? "text-up" : "text-down"
                    }`}
                  >
                    {fmtPct(tick.changePct)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                    {fmtVolume(tick.volume)}
                  </td>
                </tr>
              );
            })}
            {ticks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted">
                  Waiting for feed…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
