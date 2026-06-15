/**
 * Type surface that mirrors the public API of `@glue42/bbg-market-data`.
 *
 * The real package talks to a live Bloomberg terminal through io.Connect /
 * Glue42 Enterprise. This mock reproduces the same shapes so application code
 * (dashboard + reporting job) can be written against the real interface and
 * later swapped to the genuine package with minimal changes.
 */

export enum RequestStatus {
  Created = "Created",
  Opened = "Opened",
  Closed = "Closed",
  Failed = "Failed",
  Completed = "Completed",
}

export enum ConnectionStatus {
  Connected = "Connected",
  Disconnected = "Disconnected",
  Connecting = "Connecting",
}

export interface BBGMarketDataConfig {
  debug?: boolean;
  logLevel?: "trace" | "debug" | "info" | "warn" | "error";
  logger?: unknown;
  /** Simulation-only knobs (not present in the real package). */
  mock?: {
    /** Milliseconds between synthetic ticks. Default 1000. */
    tickIntervalMs?: number;
  };
}

export interface Subscription {
  security: string;
  fields: string[];
}

/** A single real-time market-data update for one security. */
export interface SubscriptionData {
  security: string;
  subscriptionId: string;
  [field: string]: number | string;
}

export interface SubscriptionError {
  security: string;
  message: string;
  code?: string;
}

export interface BloombergEvent {
  eventType: string;
  messages: unknown[];
  timestamp: string;
}

export class BloombergError extends Error {
  eventType: string;
  eventMessage: string;
  details: Record<string, unknown>;

  constructor(
    message: string,
    eventType = "RESPONSE_ERROR",
    eventMessage = "",
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "BloombergError";
    this.eventType = eventType;
    this.eventMessage = eventMessage;
    this.details = details;
  }
}

export type Unsubscribe = () => void;

export interface MarketDataRequest {
  readonly id: string;
  onData(cb: (data: SubscriptionData[]) => void): Unsubscribe;
  onError(cb: (error: BloombergError | Error) => void): Unsubscribe;
  onFail(cb: (errors: SubscriptionError[]) => void): Unsubscribe;
  onStatus(cb: (status: RequestStatus) => void): Unsubscribe;
  onEvent(cb: (event: BloombergEvent) => void): Unsubscribe;
  open(options?: Record<string, unknown>): Promise<void>;
  close(): Promise<void>;
}

export interface ReferenceDataRequestArguments {
  securities: string[];
  fields: string[];
  returnEids?: boolean;
}

export interface HistoricalDataRequestArguments {
  securities: string[];
  fields: string[];
  startDate: string; // YYYYMMDD
  endDate: string; // YYYYMMDD
  periodicitySelection?: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface SnapshotRequestArguments {
  security: string;
}

export interface ResponseRequest<T> {
  readonly id: string;
  onData(cb: (payload: { data: T; isLast: boolean }) => void): Unsubscribe;
  onError(cb: (error: BloombergError | Error) => void): Unsubscribe;
  onStatus(cb: (status: RequestStatus) => void): Unsubscribe;
  open(options?: { aggregateResponse?: boolean }): Promise<T>;
  close(): Promise<void>;
}

export interface BBGMarketDataAPI {
  readonly version: string;
  createMarketDataRequest(subscriptions: Subscription[]): MarketDataRequest;
  createReferenceDataRequest(
    args: ReferenceDataRequestArguments,
  ): ResponseRequest<Array<Record<string, number | string>>>;
  createHistoricalDataRequest(
    args: HistoricalDataRequestArguments,
  ): ResponseRequest<Array<Record<string, number | string>>>;
  createSnapshotRequest(
    args: SnapshotRequestArguments,
  ): ResponseRequest<Record<string, number | string>>;
  onConnectionStatusChanged(cb: (status: ConnectionStatus) => void): Unsubscribe;
}
