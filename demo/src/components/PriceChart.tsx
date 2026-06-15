"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint, LiveTick } from "@/lib/client-types";
import { fmtPct, fmtPrice, fmtTime, ticker } from "@/lib/format";

const MAX_POINTS = 180;

export function PriceChart({
  security,
  liveTick,
}: {
  security: string | null;
  liveTick: LiveTick | undefined;
}) {
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!security) return;
    loadedFor.current = null;
    setPoints([]);
    fetch(`/api/history?security=${encodeURIComponent(security)}&limit=${MAX_POINTS}`)
      .then((r) => r.json())
      .then((data: { points: HistoryPoint[] }) => {
        loadedFor.current = security;
        setPoints(data.points ?? []);
      })
      .catch(() => undefined);
  }, [security]);

  useEffect(() => {
    if (!security || !liveTick || liveTick.security !== security) return;
    if (loadedFor.current !== security) return;
    setPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.ts === liveTick.ts) return prev;
      const next = [
        ...prev,
        {
          ts: liveTick.ts,
          lastPrice: liveTick.lastPrice,
          bid: liveTick.bid,
          ask: liveTick.ask,
          volume: liveTick.volume,
          changePct: liveTick.changePct,
        },
      ];
      return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
    });
  }, [security, liveTick]);

  const { up, domain } = useMemo(() => {
    if (points.length === 0) return { up: true, domain: [0, 1] as [number, number] };
    const prices = points.map((p) => p.lastPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.15 || max * 0.01;
    const first = points[0].lastPrice;
    const lastP = points[points.length - 1].lastPrice;
    return {
      up: lastP >= first,
      domain: [min - pad, max + pad] as [number, number],
    };
  }, [points]);

  const color = up ? "var(--up)" : "var(--down)";

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Intraday Price
        </h2>
        {security && (
          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono font-semibold">{ticker(security)}</span>
            {liveTick && liveTick.security === security && (
              <>
                <span className="font-mono tabular-nums">
                  {fmtPrice(liveTick.lastPrice)}
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    liveTick.changePct >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {fmtPct(liveTick.changePct)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="min-h-[260px] flex-1 p-2">
        {points.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-muted">
            {security ? "Buffering ticks…" : "Select an instrument"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={240}>
            <AreaChart data={points} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="ts"
                tickFormatter={(ts) => fmtTime(ts)}
                stroke="var(--muted)"
                tick={{ fontSize: 11 }}
                minTickGap={48}
              />
              <YAxis
                domain={domain}
                stroke="var(--muted)"
                tick={{ fontSize: 11 }}
                width={64}
                tickFormatter={(v) => fmtPrice(v)}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--muted)" }}
                labelFormatter={(ts) => fmtTime(Number(ts))}
                formatter={(value) => [fmtPrice(Number(value)), "Last"]}
              />
              <Area
                type="monotone"
                dataKey="lastPrice"
                stroke={color}
                strokeWidth={1.8}
                fill="url(#priceFill)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
