"use client";

import { useEffect, useMemo, useState } from "react";
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
import { fmtPrice, fmtTime, ticker } from "@/lib/format";

const MAX_POINTS = 180;

interface PriceChartProps {
  security: string | null;
  liveTick: LiveTick | null;
  currency?: string;
}

interface ChartPoint {
  ts: number;
  price: number;
  label: string;
}

export function PriceChart({ security, liveTick, currency = "USD" }: PriceChartProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!security) return;

    let cancelled = false;

    fetch(`/api/history?security=${encodeURIComponent(security)}&limit=${MAX_POINTS}`)
      .then((res) => res.json())
      .then((data: { points: HistoryPoint[] }) => {
        if (!cancelled) setHistory(data.points ?? []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [security]);

  const chartData = useMemo(() => {
    const points: ChartPoint[] = history.map((p) => ({
      ts: p.ts,
      price: p.lastPrice,
      label: fmtTime(p.ts),
    }));

    if (liveTick && liveTick.security === security) {
      const last = points[points.length - 1];
      if (!last || last.ts !== liveTick.ts) {
        points.push({
          ts: liveTick.ts,
          price: liveTick.lastPrice,
          label: fmtTime(liveTick.ts),
        });
      } else {
        last.price = liveTick.lastPrice;
      }
    }

    return points.slice(-MAX_POINTS);
  }, [history, liveTick, security]);

  const priceDomain = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.05 || max * 0.01;
    return [min - pad, max + pad] as [number, number];
  }, [chartData]);

  if (!security) {
    return (
      <section className="flex h-full min-h-[240px] flex-col items-center justify-center rounded border border-border bg-panel text-sm text-muted">
        Select an instrument to view the chart
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-[240px] flex-col overflow-hidden rounded border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
          Intraday — {ticker(security)}
        </h2>
        {liveTick && (
          <span className="font-mono text-sm">
            {fmtPrice(liveTick.lastPrice, currency)}
          </span>
        )}
      </div>

      <div className="relative flex-1 p-2">
        {!ready && chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Loading history…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No history available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8a14" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ff8a14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262b36" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8b94a3", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#262b36" }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={priceDomain}
                tick={{ fill: "#8b94a3", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v: number) => fmtPrice(v, currency)}
              />
              <Tooltip
                contentStyle={{
                  background: "#171a21",
                  border: "1px solid #262b36",
                  borderRadius: 4,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#8b94a3" }}
                formatter={(value) => [fmtPrice(Number(value), currency), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#ff8a14"
                strokeWidth={1.5}
                fill="url(#priceGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
