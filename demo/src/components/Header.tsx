import type { ConnectionState } from "@/lib/client-types";
import { fmtTime } from "@/lib/format";

interface HeaderProps {
  status: ConnectionState;
  lastTickTs: number | null;
  count: number;
}

const STATUS_LABEL: Record<ConnectionState, string> = {
  connecting: "Connecting",
  live: "Live",
  reconnecting: "Reconnecting",
  error: "Disconnected",
};

const STATUS_COLOR: Record<ConnectionState, string> = {
  connecting: "bg-accent/60",
  live: "bg-up",
  reconnecting: "bg-accent",
  error: "bg-down",
};

export function Header({ status, lastTickTs, count }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold tracking-wide text-accent">
          BBG TERMINAL
        </h1>
        <span className="hidden text-xs text-muted sm:inline">
          Market Data Dashboard
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOR[status]} ${status === "live" ? "animate-pulse" : ""}`}
            aria-hidden
          />
          <span className="font-mono text-muted">
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="text-muted">
          <span className="text-foreground/60">Last tick </span>
          <span className="font-mono">
            {lastTickTs ? fmtTime(lastTickTs) : "—"}
          </span>
        </div>

        <div className="text-muted">
          <span className="text-foreground/60">Instruments </span>
          <span className="font-mono text-foreground">{count}</span>
        </div>
      </div>
    </header>
  );
}
