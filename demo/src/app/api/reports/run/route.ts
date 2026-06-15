import { NextResponse } from "next/server";
import { getMarketEngine } from "@/lib/server/market-engine";
import { runReportSinceLast } from "@/lib/server/reporting-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On-demand trigger for the SQL reporting job. Aggregates the ticks captured
 * since the previous run into the `reports` table and returns the new batch.
 *
 * Wire a Cursor automation (or any external scheduler) to POST here on a
 * cadence instead of running the cron loop in-process.
 *
 *   curl -X POST http://localhost:3000/api/reports/run
 */
export async function POST() {
  // Ensure the feed is running so there are ticks to aggregate.
  getMarketEngine().start();

  const { periodStart, periodEnd, rows } = runReportSinceLast();

  return NextResponse.json({
    ok: true,
    periodStart,
    periodEnd,
    generated: rows.length,
    rows,
  });
}
