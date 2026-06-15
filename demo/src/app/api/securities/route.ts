import { NextResponse } from "next/server";
import { getMarketEngine } from "@/lib/server/market-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const engine = getMarketEngine();
  engine.start();
  return NextResponse.json({
    connection: engine.connection,
    startedAt: engine.startedAt,
    securities: engine.getSnapshot(),
  });
}
