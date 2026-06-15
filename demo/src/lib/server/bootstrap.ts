import { getMarketEngine } from "./market-engine";

/**
 * Starts the long-lived server components exactly once per process:
 *  - the market-data engine (mock Bloomberg feed → SQLite + SSE fan-out)
 *
 * Reporting is intentionally NOT started here. The SQL aggregation job is
 * meant to be driven by an external automation that triggers it on a schedule
 * (e.g. POST /api/reports/run), rather than running in-process during dev.
 */

const globalForBootstrap = globalThis as unknown as {
  __bootstrapped?: boolean;
};

export function bootstrapServer(): void {
  if (globalForBootstrap.__bootstrapped) return;
  globalForBootstrap.__bootstrapped = true;

  getMarketEngine().start();
}
