import { NextResponse } from "next/server";
import { previousDayMovers } from "@/lib/mock-bbg/simulator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Previous trading day winners & losers (day-over-day close performance),
 * sourced from the mock feed's deterministic daily series rather than the
 * intraday tick window.
 *
 * Optional query: ?top=5 to cap each list. Defaults to 5.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const top = Math.min(Math.max(Number(searchParams.get("top") ?? 5), 1), 20);

  const { date, rows } = previousDayMovers();

  const winners = rows.filter((r) => r.changePct > 0).slice(0, top);
  const losers = rows
    .filter((r) => r.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, top);

  return NextResponse.json({ date, winners, losers, all: rows });
}
