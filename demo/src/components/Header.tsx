"use client";

import { fmtTime } from "@/lib/format";
import type { StreamStatus } from "@/hooks/useMarketStream";

const STATUS_LABEL: Record<StreamStatus, string> = {
  connecting: "CONNECTING",
  live: "LIVE",
  error: "DISCONNECTED",
};

const STATUS_COLOR: Record<StreamStatus, string> = {
  connecting: "bg-accent",
  live: "bg-up",
  error: "bg-down",
};

export function Header({
  status,
  lastUpdate,
  securityCount,
}: {
  status: StreamStatus;
  lastUpdate: number | null;
  securityCount: number;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-panel px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-accent font-bold text-black">
          B
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide">
            BBG TERMINAL{" "}
            <span className="text-muted">· Market Data Dashboard</span>
          </h1>
          <p className="text-[11px] text-muted">
            mock @glue42/bbg-market-data feed · {securityCount} securities
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOR[status]} ${
              status === "live" ? "animate-pulse" : ""
            }`}
          />
          <span className="font-mono tracking-wider text-muted">
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div className="font-mono text-muted">
          LAST&nbsp;TICK&nbsp;
          <span className="text-foreground">{fmtTime(lastUpdate)}</span>
        </div>
      </div>
    </header>
  );
}
