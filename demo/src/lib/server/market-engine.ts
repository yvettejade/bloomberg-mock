import BBGMarketDataFactory, {
  BBGMarketDataAPI,
  ConnectionStatus,
  MarketDataRequest,
  SubscriptionData,
} from "@/lib/mock-bbg";
import { SECURITIES, SecurityMeta } from "@/lib/mock-bbg/simulator";
import { insertTick } from "./db";

/**
 * Long-lived server-side engine that connects to the (mock) Bloomberg feed,
 * persists every tick into SQLite, keeps the latest snapshot per security in
 * memory, and fans ticks out to connected dashboard clients over SSE.
 *
 * A single instance lives on `globalThis` so Next.js dev hot-reloads don't
 * spin up duplicate feeds.
 */

const FIELDS = ["LAST_PRICE", "BID", "ASK", "VOLUME", "CHANGE_PCT"];

export interface LiveTick {
  security: string;
  name: string;
  sector: string;
  currency: string;
  ts: number;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  changePct: number;
}

type TickListener = (tick: LiveTick) => void;

class MarketEngine {
  private bbg: BBGMarketDataAPI;
  private request: MarketDataRequest | null = null;
  private metaBySecurity = new Map<string, SecurityMeta>();
  private latest = new Map<string, LiveTick>();
  private listeners = new Set<TickListener>();
  connection: ConnectionStatus = ConnectionStatus.Connecting;
  startedAt = Date.now();

  constructor() {
    for (const meta of SECURITIES) this.metaBySecurity.set(meta.security, meta);
    this.bbg = BBGMarketDataFactory(undefined, {
      debug: false,
      mock: { tickIntervalMs: 1000 },
    });
    this.bbg.onConnectionStatusChanged((status) => {
      this.connection = status;
    });
  }

  start(): void {
    if (this.request) return;

    const subscriptions = SECURITIES.map((s) => ({
      security: s.security,
      fields: FIELDS,
    }));

    this.request = this.bbg.createMarketDataRequest(subscriptions);

    this.request.onData((batch: SubscriptionData[]) => {
      const ts = Date.now();
      for (const item of batch) {
        const meta = this.metaBySecurity.get(item.security);
        if (!meta) continue;

        const tick: LiveTick = {
          security: item.security,
          name: meta.name,
          sector: meta.sector,
          currency: meta.currency,
          ts,
          lastPrice: Number(item.LAST_PRICE ?? 0),
          bid: Number(item.BID ?? 0),
          ask: Number(item.ASK ?? 0),
          volume: Number(item.VOLUME ?? 0),
          changePct: Number(item.CHANGE_PCT ?? 0),
        };

        this.latest.set(item.security, tick);

        insertTick({
          security: tick.security,
          ts: tick.ts,
          last_price: tick.lastPrice,
          bid: tick.bid,
          ask: tick.ask,
          volume: tick.volume,
          change_pct: tick.changePct,
        });

        for (const listener of this.listeners) listener(tick);
      }
    });

    this.request.onError((err) => {
      console.error("[market-engine] feed error:", err.message);
    });

    this.request.open();
    console.log("[market-engine] started feed for", subscriptions.length, "securities");
  }

  subscribe(listener: TickListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): LiveTick[] {
    return Array.from(this.latest.values()).sort((a, b) =>
      a.security.localeCompare(b.security),
    );
  }
}

const globalForEngine = globalThis as unknown as {
  __marketEngine?: MarketEngine;
};

export function getMarketEngine(): MarketEngine {
  if (!globalForEngine.__marketEngine) {
    globalForEngine.__marketEngine = new MarketEngine();
  }
  return globalForEngine.__marketEngine;
}
