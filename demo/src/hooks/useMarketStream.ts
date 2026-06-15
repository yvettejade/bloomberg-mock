"use client";

import { useEffect, useState } from "react";
import type { ConnectionState, LiveTick } from "@/lib/client-types";

const RECONNECT_DELAY_MS = 2_000;

export function useMarketStream() {
  const [ticks, setTicks] = useState<Record<string, LiveTick>>({});
  const [status, setStatus] = useState<ConnectionState>("connecting");
  const [lastTickTs, setLastTickTs] = useState<number | null>(null);

  useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let mounted = true;

    const connect = () => {
      if (!mounted) return;

      if (source) {
        source.close();
        source = null;
      }

      source = new EventSource("/api/stream");

      source.addEventListener("snapshot", (event) => {
        if (!mounted) return;
        const snapshot = JSON.parse(event.data) as LiveTick[];
        const next: Record<string, LiveTick> = {};
        for (const tick of snapshot) {
          next[tick.security] = tick;
        }
        setTicks(next);
        setStatus("live");
        if (snapshot.length > 0) {
          setLastTickTs(Math.max(...snapshot.map((t) => t.ts)));
        }
      });

      source.addEventListener("tick", (event) => {
        if (!mounted) return;
        const tick = JSON.parse(event.data) as LiveTick;
        setTicks((prev) => ({ ...prev, [tick.security]: tick }));
        setLastTickTs(tick.ts);
        setStatus("live");
      });

      source.onerror = () => {
        source?.close();
        source = null;
        if (!mounted) return;
        setStatus("error");
        reconnectTimer = setTimeout(() => {
          if (!mounted) return;
          setStatus("reconnecting");
          connect();
        }, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      source?.close();
    };
  }, []);

  const tickList = Object.values(ticks).sort((a, b) =>
    a.security.localeCompare(b.security),
  );

  return { ticks, tickList, status, lastTickTs, count: tickList.length };
}
