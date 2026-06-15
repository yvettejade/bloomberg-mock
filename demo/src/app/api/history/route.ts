import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recent tick history for a single security, used to seed the price chart.
 * Example: /api/history?security=AAPL%20US%20Equity&limit=120
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const security = searchParams.get("security");
  const limit = Math.min(Number(searchParams.get("limit") ?? 120), 1000);

  if (!security) {
    return NextResponse.json(
      { error: "Missing 'security' query parameter" },
      { status: 400 },
    );
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ts, last_price, bid, ask, volume, change_pct
         FROM ticks
        WHERE security = ?
        ORDER BY ts DESC
        LIMIT ?`,
    )
    .all(security, limit) as Array<{
    ts: number;
    last_price: number;
    bid: number;
    ask: number;
    volume: number;
    change_pct: number;
  }>;

  return NextResponse.json({
    security,
    points: rows.reverse().map((r) => ({
      ts: r.ts,
      lastPrice: r.last_price,
      bid: r.bid,
      ask: r.ask,
      volume: r.volume,
      changePct: r.change_pct,
    })),
  });
}
