---
name: build-dashboard
description: Build the live market-data dashboard UI for the demo app against the existing backend API routes. Use when the user asks to build, add, or rebuild the dashboard in demo/.
---

# Build Dashboard

Build a dark, Bloomberg-terminal-style dashboard at `demo/src/app/page.tsx`
that consumes the existing backend. Do not modify `src/app/api/**` or
`src/lib/server/**`.

## Data sources

- `GET /api/securities` → initial snapshot `{ securities: LiveTick[] }`.
- `GET /api/stream` → SSE: `snapshot` event (`LiveTick[]`), then `tick` events.
- `GET /api/history?security=<sec>&limit=<n>` → `{ points: HistoryPoint[] }`.
- `GET /api/reports` → latest scheduled report batch (OHLC/VWAP).
- `GET /api/movers` → top gainers/losers.

`LiveTick`: `security, name, sector, currency, ts, lastPrice, bid, ask, volume, changePct`.

## Suggested structure

- `src/hooks/useMarketStream.ts` — `EventSource` subscription → live `Record<security, LiveTick>` + connection status.
- `src/lib/client-types.ts`, `src/lib/format.ts` — client types and `fmtPrice`/`fmtPct`/`fmtVolume`/`fmtTime` helpers.
- `src/components/` — `Header`, `TickerGrid`, `PriceChart` (recharts, already installed), `MoversPanel`, `ReportPanel`.

## Requirements

- Live ticks via SSE (not full-page polling); reports panel may poll on an interval.
- Use the theme tokens already in `globals.css` (`--panel`, `--up`, `--down`, `--accent`).
- Responsive down to one column; `npm run build` passes with no type/lint errors.

## Verification (avoid hanging the terminal)

`/api/stream` is an SSE endpoint — an infinite response that never ends on its
own. Never verify with a blocking request or a foreground dev server.

- Static check: `npm run build` (completes and exits).
- If hitting the stream, always bound it: `curl --max-time 3 http://localhost:3000/api/stream`.
- Don't run `npm run dev` in the foreground to verify — reuse the already-running
  server or start it in the background.
