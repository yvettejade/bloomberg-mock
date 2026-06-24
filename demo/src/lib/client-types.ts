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

export interface HistoryPoint {
  ts: number;
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  changePct: number;
}

export interface ReportRow {
  security: string;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  close_price: number | null;
  vwap: number | null;
  tick_count: number | null;
  change_pct: number | null;
  period_start: number;
  period_end: number;
}

export interface ReportHistoryEntry {
  generated_at: number;
  securities: number;
  ticks: number;
}

export interface ReportsResponse {
  generatedAt: number | null;
  rows: ReportRow[];
  history?: ReportHistoryEntry[];
}

export interface DayMover {
  security: string;
  name: string;
  sector: string;
  date: string;
  prevClose: number;
  priorClose: number;
  changeAbs: number;
  changePct: number;
}

export interface MoversResponse {
  date: string;
  winners: DayMover[];
  losers: DayMover[];
  all: DayMover[];
}

export type ConnectionState = "connecting" | "live" | "reconnecting" | "error";
