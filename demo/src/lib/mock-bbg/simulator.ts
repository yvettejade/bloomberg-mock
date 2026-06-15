/**
 * Synthetic market simulation that powers the mock Bloomberg feed.
 *
 * Maintains a module-level price state per security so that every request
 * (and the persisted tick history) sees a single consistent random walk.
 */

export interface SecurityMeta {
  security: string;
  name: string;
  sector: string;
  currency: string;
  open: number;
}

export const SECURITIES: SecurityMeta[] = [
  { security: "AAPL US Equity", name: "Apple Inc", sector: "Technology", currency: "USD", open: 212.5 },
  { security: "MSFT US Equity", name: "Microsoft Corp", sector: "Technology", currency: "USD", open: 432.1 },
  { security: "IBM US Equity", name: "Intl Business Machines", sector: "Technology", currency: "USD", open: 178.3 },
  { security: "NVDA US Equity", name: "NVIDIA Corp", sector: "Technology", currency: "USD", open: 121.8 },
  { security: "AMZN US Equity", name: "Amazon.com Inc", sector: "Consumer Disc", currency: "USD", open: 185.2 },
  { security: "TSLA US Equity", name: "Tesla Inc", sector: "Consumer Disc", currency: "USD", open: 248.4 },
  { security: "JPM US Equity", name: "JPMorgan Chase & Co", sector: "Financials", currency: "USD", open: 205.6 },
  { security: "GS US Equity", name: "Goldman Sachs Group", sector: "Financials", currency: "USD", open: 478.9 },
  { security: "XOM US Equity", name: "Exxon Mobil Corp", sector: "Energy", currency: "USD", open: 113.7 },
  { security: "VOD LN Equity", name: "Vodafone Group PLC", sector: "Telecom", currency: "GBp", open: 72.4 },
];

interface PriceState {
  meta: SecurityMeta;
  last: number;
  volatility: number;
  cumulativeVolume: number;
}

const state = new Map<string, PriceState>();

for (const meta of SECURITIES) {
  state.set(meta.security, {
    meta,
    last: meta.open,
    // Higher beta names get a wider per-tick move.
    volatility: 0.0009 + Math.random() * 0.0011,
    cumulativeVolume: Math.floor(100_000 + Math.random() * 500_000),
  });
}

/** Box–Muller transform for a standard normal sample. */
function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round(value: number, dp = 4): number {
  return Number(value.toFixed(dp));
}

export interface Tick {
  security: string;
  LAST_PRICE: number;
  BID: number;
  ASK: number;
  BID_YIELD: number;
  ASK_YIELD: number;
  VOLUME: number;
  CHANGE_PCT: number;
}

export function isKnownSecurity(security: string): boolean {
  return state.has(security);
}

export function listSecurities(): SecurityMeta[] {
  return SECURITIES;
}

/** Advance the random walk for a single security and return the new tick. */
export function nextTick(security: string): Tick | null {
  const s = state.get(security);
  if (!s) return null;

  const drift = gaussian() * s.volatility;
  s.last = Math.max(0.01, s.last * (1 + drift));
  s.cumulativeVolume += Math.floor(Math.random() * 5_000);

  const spread = Math.max(0.01, s.last * 0.0002);
  const bid = s.last - spread / 2;
  const ask = s.last + spread / 2;
  const changePct = ((s.last - s.meta.open) / s.meta.open) * 100;

  return {
    security,
    LAST_PRICE: round(s.last, 2),
    BID: round(bid, 2),
    ASK: round(ask, 2),
    BID_YIELD: round(2.5 + gaussian() * 0.15, 3),
    ASK_YIELD: round(2.52 + gaussian() * 0.15, 3),
    VOLUME: s.cumulativeVolume,
    CHANGE_PCT: round(changePct, 3),
  };
}

/** A point-in-time snapshot without advancing the walk. */
export function snapshot(security: string): Tick | null {
  const s = state.get(security);
  if (!s) return null;
  const spread = Math.max(0.01, s.last * 0.0002);
  return {
    security,
    LAST_PRICE: round(s.last, 2),
    BID: round(s.last - spread / 2, 2),
    ASK: round(s.last + spread / 2, 2),
    BID_YIELD: round(2.5, 3),
    ASK_YIELD: round(2.52, 3),
    VOLUME: s.cumulativeVolume,
    CHANGE_PCT: round(((s.last - s.meta.open) / s.meta.open) * 100, 3),
  };
}
