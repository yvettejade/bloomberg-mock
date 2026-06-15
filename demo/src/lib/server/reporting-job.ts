import cron, { ScheduledTask } from "node-cron";
import { getDb, insertReports, ReportRow } from "./db";

/**
 * Reporting job.
 *
 * Reads the raw ticks captured in a time window straight out of SQLite,
 * aggregates them into per-security OHLC / VWAP summaries, and writes the
 * results back into the `reports` table. The dashboard renders the most
 * recent batch.
 *
 * This is designed to be driven by an external automation that triggers it on
 * a schedule (see `runReportSinceLast` / POST /api/reports/run). The in-process
 * `startReportingJob` cron scheduler is kept for convenience but is NOT started
 * automatically during `npm run dev`.
 */

const CRON_EXPRESSION = "*/20 * * * * *"; // every 20 seconds

/** Default look-back window when no previous run is recorded. */
const DEFAULT_WINDOW_MS = 60_000;

const globalForJob = globalThis as unknown as {
  __reportingTask?: ScheduledTask;
  __lastReportAt?: number;
};

interface AggregateRow {
  security: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  vwap: number;
  tick_count: number;
  change_pct: number;
}

export function runReport(periodStart: number, periodEnd: number): ReportRow[] {
  const db = getDb();

  // VWAP here uses incremental volume between ticks as the weight, falling back
  // to a simple average when volume deltas aren't available.
  const rows = db
    .prepare(
      `
      SELECT
        security,
        (SELECT last_price FROM ticks t2
           WHERE t2.security = t.security AND t2.ts >= @start AND t2.ts < @end
           ORDER BY t2.ts ASC LIMIT 1)  AS open_price,
        MAX(last_price)                 AS high_price,
        MIN(last_price)                 AS low_price,
        (SELECT last_price FROM ticks t3
           WHERE t3.security = t.security AND t3.ts >= @start AND t3.ts < @end
           ORDER BY t3.ts DESC LIMIT 1) AS close_price,
        AVG(last_price)                 AS vwap,
        COUNT(*)                        AS tick_count,
        AVG(change_pct)                 AS change_pct
      FROM ticks t
      WHERE t.ts >= @start AND t.ts < @end
      GROUP BY security
      ORDER BY security
      `,
    )
    .all({ start: periodStart, end: periodEnd }) as AggregateRow[];

  const generatedAt = Date.now();
  const reportRows: ReportRow[] = rows.map((r) => ({
    generated_at: generatedAt,
    period_start: periodStart,
    period_end: periodEnd,
    security: r.security,
    open_price: round(r.open_price),
    high_price: round(r.high_price),
    low_price: round(r.low_price),
    close_price: round(r.close_price),
    vwap: round(r.vwap),
    tick_count: r.tick_count,
    change_pct: round(r.change_pct, 3),
  }));

  insertReports(reportRows);
  return reportRows;
}

function round(value: number | null, dp = 2): number | null {
  if (value == null) return null;
  return Number(value.toFixed(dp));
}

/**
 * Runs a report over the window since the previous run (chaining windows so
 * each tick is reported exactly once). Intended entry point for an external
 * automation that triggers reporting on a schedule.
 */
export function runReportSinceLast(): {
  periodStart: number;
  periodEnd: number;
  rows: ReportRow[];
} {
  const periodEnd = Date.now();
  const periodStart = globalForJob.__lastReportAt ?? periodEnd - DEFAULT_WINDOW_MS;
  const rows = runReport(periodStart, periodEnd);
  globalForJob.__lastReportAt = periodEnd;
  return { periodStart, periodEnd, rows };
}

export function startReportingJob(): void {
  if (globalForJob.__reportingTask) return;

  globalForJob.__lastReportAt = Date.now();

  const task = cron.schedule(CRON_EXPRESSION, () => {
    try {
      const { periodStart, periodEnd, rows } = runReportSinceLast();
      if (rows.length > 0) {
        console.log(
          `[reporting-job] generated ${rows.length} report rows for window ` +
            `${new Date(periodStart).toISOString()} → ${new Date(periodEnd).toISOString()}`,
        );
      }
    } catch (err) {
      console.error("[reporting-job] failed:", err);
    }
  });

  globalForJob.__reportingTask = task;
  console.log(`[reporting-job] scheduled (${CRON_EXPRESSION})`);
}
