/**
 * Drop-in mock of `@glue42/bbg-market-data`.
 *
 * Usage mirrors the real package:
 *
 *   import BBGMarketDataFactory from "@/lib/mock-bbg";
 *   const bbg = BBGMarketDataFactory(undefined, { debug: true });
 *   const req = bbg.createMarketDataRequest([{ security: "IBM US Equity", fields: ["LAST_PRICE"] }]);
 *   req.onData(console.log);
 *   req.open();
 *
 * Swap the import for `@glue42/bbg-market-data` (and pass a real io.interop
 * instance) to talk to an actual Bloomberg terminal.
 */

import {
  BBGMarketDataAPI,
  BBGMarketDataConfig,
  BloombergError,
  BloombergEvent,
  ConnectionStatus,
  HistoricalDataRequestArguments,
  MarketDataRequest,
  ReferenceDataRequestArguments,
  RequestStatus,
  ResponseRequest,
  SnapshotRequestArguments,
  Subscription,
  SubscriptionData,
  SubscriptionError,
  Unsubscribe,
} from "./types";
import { isKnownSecurity, nextTick, snapshot } from "./simulator";

export * from "./types";

const VERSION = "0.9.0-mock";

let requestCounter = 0;
function nextId(prefix: string): string {
  requestCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${requestCounter}`;
}

function createEmitter<T>() {
  const listeners = new Set<(value: T) => void>();
  return {
    subscribe(cb: (value: T) => void): Unsubscribe {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    emit(value: T) {
      for (const cb of listeners) cb(value);
    },
    clear() {
      listeners.clear();
    },
  };
}

class MockMarketDataRequest implements MarketDataRequest {
  readonly id = nextId("mkt");
  private data = createEmitter<SubscriptionData[]>();
  private error = createEmitter<BloombergError | Error>();
  private fail = createEmitter<SubscriptionError[]>();
  private status = createEmitter<RequestStatus>();
  private event = createEmitter<BloombergEvent>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentStatus = RequestStatus.Created;

  constructor(
    private subscriptions: Subscription[],
    private tickIntervalMs: number,
  ) {}

  onData(cb: (data: SubscriptionData[]) => void): Unsubscribe {
    return this.data.subscribe(cb);
  }
  onError(cb: (error: BloombergError | Error) => void): Unsubscribe {
    return this.error.subscribe(cb);
  }
  onFail(cb: (errors: SubscriptionError[]) => void): Unsubscribe {
    return this.fail.subscribe(cb);
  }
  onStatus(cb: (status: RequestStatus) => void): Unsubscribe {
    return this.status.subscribe(cb);
  }
  onEvent(cb: (event: BloombergEvent) => void): Unsubscribe {
    return this.event.subscribe(cb);
  }

  private setStatus(status: RequestStatus) {
    this.currentStatus = status;
    this.status.emit(status);
  }

  async open(): Promise<void> {
    const unknown = this.subscriptions.filter((s) => !isKnownSecurity(s.security));
    if (unknown.length > 0) {
      this.fail.emit(
        unknown.map((s) => ({
          security: s.security,
          message: `Unknown security: ${s.security}`,
          code: "INVALID_SECURITY",
        })),
      );
    }

    const valid = this.subscriptions.filter((s) => isKnownSecurity(s.security));
    if (valid.length === 0) {
      this.error.emit(new BloombergError("No valid securities in subscription"));
      this.setStatus(RequestStatus.Failed);
      return;
    }

    this.setStatus(RequestStatus.Opened);

    const emitTicks = () => {
      const batch: SubscriptionData[] = [];
      for (const sub of valid) {
        const tick = nextTick(sub.security);
        if (!tick) continue;
        const filtered: SubscriptionData = {
          security: sub.security,
          subscriptionId: this.id,
        };
        for (const field of sub.fields) {
          if (field in tick) {
            filtered[field] = (tick as unknown as Record<string, number>)[field];
          }
        }
        batch.push(filtered);
      }
      if (batch.length > 0) {
        this.data.emit(batch);
        this.event.emit({
          eventType: "SUBSCRIPTION_DATA",
          messages: batch,
          timestamp: new Date().toISOString(),
        });
      }
    };

    emitTicks();
    this.timer = setInterval(emitTicks, this.tickIntervalMs);
  }

  async close(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.currentStatus !== RequestStatus.Closed) {
      this.setStatus(RequestStatus.Closed);
    }
    this.data.clear();
    this.error.clear();
    this.fail.clear();
    this.event.clear();
    this.status.clear();
  }
}

function createResponseRequest<T>(
  resolver: () => T,
  prefix: string,
): ResponseRequest<T> {
  const id = nextId(prefix);
  const data = createEmitter<{ data: T; isLast: boolean }>();
  const error = createEmitter<BloombergError | Error>();
  const status = createEmitter<RequestStatus>();

  return {
    id,
    onData: (cb) => data.subscribe(cb),
    onError: (cb) => error.subscribe(cb),
    onStatus: (cb) => status.subscribe(cb),
    async open() {
      status.emit(RequestStatus.Opened);
      try {
        const result = resolver();
        data.emit({ data: result, isLast: true });
        status.emit(RequestStatus.Completed);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        error.emit(e);
        status.emit(RequestStatus.Failed);
        throw e;
      }
    },
    async close() {
      status.emit(RequestStatus.Closed);
    },
  };
}

class MockBBGMarketData implements BBGMarketDataAPI {
  readonly version = VERSION;
  private connection = createEmitter<ConnectionStatus>();
  private tickIntervalMs: number;

  constructor(config: BBGMarketDataConfig = {}) {
    this.tickIntervalMs = config.mock?.tickIntervalMs ?? 1000;
    // Simulate an async connection coming up shortly after init.
    setTimeout(() => this.connection.emit(ConnectionStatus.Connected), 50);
  }

  createMarketDataRequest(subscriptions: Subscription[]): MarketDataRequest {
    return new MockMarketDataRequest(subscriptions, this.tickIntervalMs);
  }

  createReferenceDataRequest(args: ReferenceDataRequestArguments) {
    return createResponseRequest(() => {
      return args.securities.map((security) => {
        const snap = snapshot(security);
        const row: Record<string, number | string> = { security };
        for (const field of args.fields) {
          if (snap && field in snap) {
            row[field] = (snap as unknown as Record<string, number>)[field];
          } else if (snap) {
            row[field] = snap.LAST_PRICE;
          }
        }
        return row;
      });
    }, "ref");
  }

  createHistoricalDataRequest(args: HistoricalDataRequestArguments) {
    return createResponseRequest(() => {
      // Generate a deterministic-ish daily series between the dates.
      const rows: Array<Record<string, number | string>> = [];
      for (const security of args.securities) {
        const snap = snapshot(security);
        const base = snap?.LAST_PRICE ?? 100;
        rows.push({
          security,
          date: args.startDate,
          PX_LAST: Number((base * 0.95).toFixed(2)),
        });
        rows.push({
          security,
          date: args.endDate,
          PX_LAST: Number((base * 1.02).toFixed(2)),
        });
      }
      return rows;
    }, "hist");
  }

  createSnapshotRequest(args: SnapshotRequestArguments) {
    return createResponseRequest(() => {
      const snap = snapshot(args.security);
      if (!snap) {
        throw new BloombergError(`Unknown security: ${args.security}`);
      }
      return snap as unknown as Record<string, number | string>;
    }, "snap");
  }

  onConnectionStatusChanged(cb: (status: ConnectionStatus) => void): Unsubscribe {
    return this.connection.subscribe(cb);
  }
}

/**
 * Factory matching `@glue42/bbg-market-data`'s default export.
 * The first argument (io.interop) is accepted for signature compatibility
 * but ignored by the mock.
 */
export default function BBGMarketDataFactory(
  _interop?: unknown,
  config: BBGMarketDataConfig = {},
): BBGMarketDataAPI {
  return new MockBBGMarketData(config);
}
