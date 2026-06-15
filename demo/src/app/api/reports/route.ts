import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the most recent batch of reports produced by the scheduled job,
 * sorted by absolute change so the dashboard can highlight top movers.
 */
export async function GET() {
  const db = getDb();

  const latest = db
    .prepare(`SELECT MAX(generated_at) AS generated_at FROM reports`)
    .get() as { generated_at: number | null };

  if (!latest.generated_at) {
    return NextResponse.json({ generatedAt: null, rows: [] });
  }

  const rows = db
    .prepare(
      `SELECT security, open_price, high_price, low_price, close_price,
              vwap, tick_count, change_pct, period_start, period_end
         FROM reports
        WHERE generated_at = ?
        ORDER BY ABS(change_pct) DESC`,
    )
    .all(latest.generated_at);

  const history = db
    .prepare(
      `SELECT generated_at, COUNT(*) AS securities,
              SUM(tick_count) AS ticks
         FROM reports
        GROUP BY generated_at
        ORDER BY generated_at DESC
        LIMIT 10`,
    )
    .all();

  return NextResponse.json({
    generatedAt: latest.generated_at,
    rows,
    history,
  });
}
