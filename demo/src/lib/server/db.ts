import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

/**
 * Single shared SQLite connection for the whole server process.
 * Stores the raw market-data ticks captured from the (mock) Bloomberg feed
 * and the periodic reports produced by the scheduled reporting job.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "market.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS ticks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      security    TEXT    NOT NULL,
      ts          INTEGER NOT NULL,      -- epoch ms
      last_price  REAL    NOT NULL,
      bid         REAL,
      ask         REAL,
      volume      INTEGER,
      change_pct  REAL
    );
    CREATE INDEX IF NOT EXISTS idx_ticks_security_ts ON ticks (security, ts);
    CREATE INDEX IF NOT EXISTS idx_ticks_ts ON ticks (ts);

    CREATE TABLE IF NOT EXISTS reports (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      generated_at  INTEGER NOT NULL,    -- epoch ms
      period_start  INTEGER NOT NULL,
      period_end    INTEGER NOT NULL,
      security      TEXT    NOT NULL,
      open_price    REAL,
      high_price    REAL,
      low_price     REAL,
      close_price   REAL,
      vwap          REAL,
      tick_count    INTEGER,
      change_pct    REAL
    );
    CREATE INDEX IF NOT EXISTS idx_reports_generated ON reports (generated_at);
  `);

  return db;
}

export interface TickRow {
  security: string;
  ts: number;
  last_price: number;
  bid: number | null;
  ask: number | null;
  volume: number | null;
  change_pct: number | null;
}

const insertTickStmt = () =>
  getDb().prepare(
    `INSERT INTO ticks (security, ts, last_price, bid, ask, volume, change_pct)
     VALUES (@security, @ts, @last_price, @bid, @ask, @volume, @change_pct)`,
  );

let _insertTick: Database.Statement | null = null;
export function insertTick(row: TickRow): void {
  if (!_insertTick) _insertTick = insertTickStmt();
  _insertTick.run(row);
}

export interface ReportRow {
  generated_at: number;
  period_start: number;
  period_end: number;
  security: string;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  close_price: number | null;
  vwap: number | null;
  tick_count: number | null;
  change_pct: number | null;
}

let _insertReport: Database.Statement | null = null;
export function insertReports(rows: ReportRow[]): void {
  if (rows.length === 0) return;
  if (!_insertReport) {
    _insertReport = getDb().prepare(
      `INSERT INTO reports
        (generated_at, period_start, period_end, security, open_price, high_price,
         low_price, close_price, vwap, tick_count, change_pct)
       VALUES
        (@generated_at, @period_start, @period_end, @security, @open_price, @high_price,
         @low_price, @close_price, @vwap, @tick_count, @change_pct)`,
    );
  }
  const insertMany = getDb().transaction((items: ReportRow[]) => {
    for (const item of items) _insertReport!.run(item);
  });
  insertMany(rows);
}
