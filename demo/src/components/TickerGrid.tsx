import type { LiveTick } from "@/lib/client-types";
import {
  changeColorClass,
  fmtPct,
  fmtPrice,
  fmtVolume,
  ticker,
} from "@/lib/format";

interface TickerGridProps {
  ticks: LiveTick[];
  selected: string | null;
  onSelect: (security: string) => void;
}

export function TickerGrid({ ticks, selected, onSelect }: TickerGridProps) {
  return (
    <section className="flex flex-col overflow-hidden rounded border border-border bg-panel">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
          Watchlist
        </h2>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-panel-2 text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Ticker</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="hidden px-3 py-2 font-medium md:table-cell">
                Sector
              </th>
              <th className="px-3 py-2 text-right font-medium">Last</th>
              <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">
                Bid
              </th>
              <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">
                Ask
              </th>
              <th className="px-3 py-2 text-right font-medium">Chg%</th>
              <th className="hidden px-3 py-2 text-right font-medium lg:table-cell">
                Vol
              </th>
            </tr>
          </thead>
          <tbody>
            {ticks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted">
                  Waiting for market data…
                </td>
              </tr>
            ) : (
              ticks.map((tick) => {
                const isSelected = tick.security === selected;
                return (
                  <tr
                    key={tick.security}
                    onClick={() => onSelect(tick.security)}
                    className={`cursor-pointer border-t border-border font-mono transition-colors hover:bg-panel-2 ${
                      isSelected ? "bg-panel-2 ring-1 ring-inset ring-accent/40" : ""
                    }`}
                  >
                    <td className="px-3 py-1.5 font-semibold text-accent">
                      {ticker(tick.security)}
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-1.5 font-sans text-foreground">
                      {tick.name}
                    </td>
                    <td className="hidden truncate px-3 py-1.5 font-sans text-muted md:table-cell">
                      {tick.sector}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {fmtPrice(tick.lastPrice, tick.currency)}
                    </td>
                    <td className="hidden px-3 py-1.5 text-right text-muted sm:table-cell">
                      {fmtPrice(tick.bid, tick.currency)}
                    </td>
                    <td className="hidden px-3 py-1.5 text-right text-muted sm:table-cell">
                      {fmtPrice(tick.ask, tick.currency)}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right ${changeColorClass(tick.changePct)}`}
                    >
                      {fmtPct(tick.changePct)}
                    </td>
                    <td className="hidden px-3 py-1.5 text-right text-muted lg:table-cell">
                      {fmtVolume(tick.volume)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
