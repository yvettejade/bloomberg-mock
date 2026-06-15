"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveTick } from "@/lib/client-types";

export type StreamStatus = "connecting" | "live" | "error";

export interface MarketStreamState {
  ticks: Record<string, LiveTick>;
  status: StreamStatus;
  lastUpdate: number | null;
}

/**
 * Subscribes to the /api/stream SSE endpoint and keeps a live map of the most
 * recent tick per security. Returns a counter (`version`) that bumps on every
 * update so consumers can drive flash animations.
 */
export function useMarketStream() {
  const [state, setState] = useState<MarketStreamState>({
    ticks: {},
    status: "connecting",
    lastUpdate: null,
  });
  const lastPriceRef = useRef<Record<string, number>>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const source = new EventSource("/api/stream");

    const applyTick = (tick: LiveTick) => {
      lastPriceRef.current[tick.security] = tick.lastPrice;
      setState((prev) => ({
        status: "live",
        lastUpdate: tick.ts,
        ticks: { ...prev.ticks, [tick.security]: tick },
      }));
      setVersion((v) => v + 1);
    };

    source.addEventListener("snapshot", (e) => {
      const list = JSON.parse((e as MessageEvent).data) as LiveTick[];
      const map: Record<string, LiveTick> = {};
      for (const t of list) {
        map[t.security] = t;
        lastPriceRef.current[t.security] = t.lastPrice;
      }
      setState({
        status: "live",
        lastUpdate: Date.now(),
        ticks: map,
      });
    });

    source.addEventListener("tick", (e) => {
      applyTick(JSON.parse((e as MessageEvent).data) as LiveTick);
    });

    source.onerror = () => {
      setState((prev) => ({ ...prev, status: "error" }));
    };

    return () => source.close();
  }, []);

  return { ...state, version };
}
