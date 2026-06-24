#!/usr/bin/env node
// Parse, validate, and format a portfolio JSON file for the high-density dashboard.
// Usage: node parse_portfolio.mjs <path-to-portfolio.json>
// Exits non-zero and lists problems when the standard schema is violated.

import { readFileSync } from "node:fs";

const SEVERITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
const BREACH_STATUSES = new Set(["OPEN", "WARNING", "RESOLVED"]);

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd = (n) => usdFmt.format(n);
const signedUsd = (n) => (n < 0 ? `-${usd(Math.abs(n))}` : `+${usd(n)}`);
const pct = (ratio) => `${(ratio * 100).toFixed(2)}%`;
const signedPct = (ratio) =>
  ratio < 0 ? `-${pct(Math.abs(ratio))}` : `+${pct(ratio)}`;
const direction = (n) => (n > 0 ? "up" : n < 0 ? "down" : "flat");

function isNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isString(v) {
  return typeof v === "string" && v.length > 0;
}

function validate(p) {
  const errors = [];
  const req = (cond, msg) => {
    if (!cond) errors.push(msg);
  };

  req(isString(p?.portfolio_id), "portfolio_id: required non-empty string");
  req(isString(p?.client_name), "client_name: required non-empty string");
  req(isString(p?.last_updated), "last_updated: required ISO-8601 string");
  req(
    isString(p?.compliance_status),
    "compliance_status: required non-empty string"
  );

  const m = p?.metrics;
  req(m && typeof m === "object", "metrics: required object");
  if (m && typeof m === "object") {
    req(isNumber(m.total_aum_usd), "metrics.total_aum_usd: required number");
    req(
      isNumber(m.unrealized_pnl_usd),
      "metrics.unrealized_pnl_usd: required number"
    );
    req(
      isNumber(m.cash_reserve_ratio) &&
        m.cash_reserve_ratio >= 0 &&
        m.cash_reserve_ratio <= 1,
      "metrics.cash_reserve_ratio: required number in [0,1]"
    );
  }

  const allocs = p?.allocations;
  req(
    Array.isArray(allocs) && allocs.length > 0,
    "allocations: required non-empty array"
  );
  if (Array.isArray(allocs)) {
    allocs.forEach((a, i) => {
      req(isString(a?.asset), `allocations[${i}].asset: required non-empty string`);
      req(
        isNumber(a?.value_usd) && a.value_usd >= 0,
        `allocations[${i}].value_usd: required non-negative number`
      );
      req(
        isNumber(a?.risk_score) && a.risk_score >= 1 && a.risk_score <= 10,
        `allocations[${i}].risk_score: required number in [1,10]`
      );
      if (a?.target_pct !== undefined) {
        req(
          isNumber(a.target_pct) && a.target_pct >= 0 && a.target_pct <= 1,
          `allocations[${i}].target_pct: must be a number in [0,1] when present`
        );
      }
    });
  }

  // Optional pnl block — validate shape only if present.
  if (p?.pnl !== undefined) {
    const pnl = p.pnl;
    req(pnl && typeof pnl === "object", "pnl: must be an object when present");
    if (pnl && typeof pnl === "object") {
      for (const f of [
        "net_pnl_usd",
        "realized_pnl_usd",
        "unrealized_pnl_usd",
        "daily_change_usd",
        "daily_change_pct",
        "mtd_pnl_usd",
        "ytd_pnl_usd",
      ]) {
        req(isNumber(pnl[f]), `pnl.${f}: required number when pnl present`);
      }
      if (pnl.by_asset !== undefined) {
        req(
          Array.isArray(pnl.by_asset),
          "pnl.by_asset: must be an array when present"
        );
        if (Array.isArray(pnl.by_asset)) {
          pnl.by_asset.forEach((b, i) => {
            req(
              isString(b?.asset),
              `pnl.by_asset[${i}].asset: required non-empty string`
            );
            req(
              isNumber(b?.net_pnl_usd),
              `pnl.by_asset[${i}].net_pnl_usd: required number`
            );
            req(
              isNumber(b?.daily_change_usd),
              `pnl.by_asset[${i}].daily_change_usd: required number`
            );
          });
        }
      }
    }
  }

  // Optional compliance block — validate shape only if present.
  if (p?.compliance !== undefined) {
    const c = p.compliance;
    req(
      c && typeof c === "object",
      "compliance: must be an object when present"
    );
    if (c && typeof c === "object") {
      req(isString(c.status), "compliance.status: required non-empty string");
      req(
        isNumber(c.open_breach_count),
        "compliance.open_breach_count: required number"
      );
      req(
        isNumber(c.warning_count),
        "compliance.warning_count: required number"
      );
      if (c.breaches !== undefined) {
        req(
          Array.isArray(c.breaches),
          "compliance.breaches: must be an array when present"
        );
        if (Array.isArray(c.breaches)) {
          c.breaches.forEach((b, i) => {
            req(isString(b?.id), `compliance.breaches[${i}].id: required string`);
            req(
              isString(b?.rule),
              `compliance.breaches[${i}].rule: required string`
            );
            req(
              SEVERITIES.has(b?.severity),
              `compliance.breaches[${i}].severity: one of ${[...SEVERITIES].join(", ")}`
            );
            req(
              BREACH_STATUSES.has(b?.status),
              `compliance.breaches[${i}].status: one of ${[...BREACH_STATUSES].join(", ")}`
            );
            if (b?.limit_pct !== null && b?.limit_pct !== undefined) {
              req(
                isNumber(b.limit_pct),
                `compliance.breaches[${i}].limit_pct: number or null`
              );
            }
            if (b?.current_pct !== null && b?.current_pct !== undefined) {
              req(
                isNumber(b.current_pct),
                `compliance.breaches[${i}].current_pct: number or null`
              );
            }
          });
        }
      }
    }
  }

  return errors;
}

function buildOutput(p) {
  const allocTotal = p.allocations.reduce((s, a) => s + a.value_usd, 0);

  // Value-weighted risk: Σ(risk × value) / Σ(value).
  const weightedRiskRaw =
    allocTotal > 0
      ? p.allocations.reduce((s, a) => s + a.risk_score * a.value_usd, 0) /
        allocTotal
      : 0;
  const weighted_risk = Math.round(weightedRiskRaw * 100) / 100;

  const out = {
    portfolio_id: p.portfolio_id,
    client_name: p.client_name,
    last_updated: p.last_updated,
    compliance_status: p.compliance_status,
    metrics: {
      total_aum: usd(p.metrics.total_aum_usd),
      unrealized_pnl: signedUsd(p.metrics.unrealized_pnl_usd),
      cash_reserve_ratio: pct(p.metrics.cash_reserve_ratio),
      weighted_risk,
    },
    allocations: p.allocations.map((a) => {
      const weight = allocTotal > 0 ? a.value_usd / allocTotal : 0;
      const row = {
        asset: a.asset,
        value: usd(a.value_usd),
        risk_score: a.risk_score,
        weight_pct: pct(weight),
      };
      if (a.target_pct !== undefined) {
        row.target_pct = pct(a.target_pct);
        row.drift_pct = signedPct(weight - a.target_pct);
      }
      return row;
    }),
  };

  if (p.pnl && typeof p.pnl === "object") {
    const pnl = p.pnl;
    out.pnl = {
      net_pnl: signedUsd(pnl.net_pnl_usd),
      realized_pnl: signedUsd(pnl.realized_pnl_usd),
      unrealized_pnl: signedUsd(pnl.unrealized_pnl_usd),
      daily_change: signedUsd(pnl.daily_change_usd),
      daily_change_pct: signedPct(pnl.daily_change_pct),
      mtd_pnl: signedUsd(pnl.mtd_pnl_usd),
      ytd_pnl: signedUsd(pnl.ytd_pnl_usd),
    };
    if (Array.isArray(pnl.by_asset)) {
      out.pnl.by_asset = pnl.by_asset.map((b) => ({
        asset: b.asset,
        net_pnl: signedUsd(b.net_pnl_usd),
        daily_change: signedUsd(b.daily_change_usd),
        direction: direction(b.daily_change_usd),
      }));
    }
  }

  if (p.compliance && typeof p.compliance === "object") {
    const c = p.compliance;
    out.compliance = {
      status: c.status,
      open_breach_count: c.open_breach_count,
      warning_count: c.warning_count,
      last_scan: c.last_scan,
    };
    if (Array.isArray(c.breaches)) {
      out.compliance.breaches = c.breaches.map((b) => ({
        id: b.id,
        rule: b.rule,
        severity: b.severity,
        status: b.status,
        asset: b.asset,
        limit: b.limit_pct == null ? null : pct(b.limit_pct),
        current: b.current_pct == null ? null : pct(b.current_pct),
        detected_at: b.detected_at,
        description: b.description,
      }));
    }
  }

  return out;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node parse_portfolio.mjs <path-to-portfolio.json>");
    process.exit(2);
  }

  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch (e) {
    console.error(`Cannot read file "${file}": ${e.message}`);
    process.exit(2);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in "${file}": ${e.message}`);
    process.exit(2);
  }

  const errors = validate(data);
  if (errors.length > 0) {
    console.error(`Portfolio validation failed (${errors.length} issue(s)):`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(buildOutput(data), null, 2) + "\n");
}

main();
