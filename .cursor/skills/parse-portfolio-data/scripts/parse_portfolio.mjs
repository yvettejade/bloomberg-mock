#!/usr/bin/env node
// Parse + validate a portfolio JSON file and emit presentation-ready metrics.
// All financial figures are returned as standard USD strings.
//
// Usage: node parse_portfolio.mjs <path-to-portfolio.json>
import fs from "node:fs";

const REQUIRED_TOP = [
  "portfolio_id",
  "client_name",
  "last_updated",
  "compliance_status",
  "metrics",
  "allocations",
];
const REQUIRED_METRICS = [
  "total_aum_usd",
  "unrealized_pnl_usd",
  "cash_reserve_ratio",
];
const REQUIRED_ALLOC = ["asset", "value_usd", "risk_score"];

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const usd = (n) => usdFormatter.format(n);
const pct = (ratio) => `${(ratio * 100).toFixed(2)}%`;
// Signed USD/percent for P&L and deltas, so the UI can show gains/losses
// directionally (e.g. "-$312,750.00") without re-deriving the sign.
const signedUsd = (n) => `${n < 0 ? "-" : "+"}${usd(Math.abs(n))}`;
const signedPct = (ratio) =>
  `${ratio < 0 ? "-" : "+"}${(Math.abs(ratio) * 100).toFixed(2)}%`;

function validate(p) {
  const errors = [];
  if (typeof p !== "object" || p === null) {
    return ["root is not an object"];
  }
  for (const k of REQUIRED_TOP) {
    if (!(k in p)) errors.push(`missing field: ${k}`);
  }
  if (p.metrics && typeof p.metrics === "object") {
    for (const k of REQUIRED_METRICS) {
      if (!(k in p.metrics)) errors.push(`missing metrics.${k}`);
      else if (typeof p.metrics[k] !== "number")
        errors.push(`metrics.${k} must be a number`);
    }
  }
  if (Array.isArray(p.allocations)) {
    p.allocations.forEach((a, i) => {
      for (const k of REQUIRED_ALLOC) {
        if (!(k in a)) errors.push(`missing allocations[${i}].${k}`);
      }
    });
  } else {
    errors.push("allocations must be an array");
  }
  return errors;
}

function weightedRisk(allocations) {
  const totalValue = allocations.reduce((s, a) => s + a.value_usd, 0);
  if (totalValue === 0) return 0;
  const weighted = allocations.reduce(
    (s, a) => s + a.risk_score * a.value_usd,
    0
  );
  return weighted / totalValue;
}

// Optional `pnl` block -> pre-formatted strings for the Net PnL view.
function formatPnl(pnl) {
  if (!pnl || typeof pnl !== "object") return null;
  const num = (v) => (typeof v === "number" ? v : null);
  const out = {
    net_pnl: num(pnl.net_pnl_usd) === null ? null : signedUsd(pnl.net_pnl_usd),
    realized_pnl:
      num(pnl.realized_pnl_usd) === null ? null : signedUsd(pnl.realized_pnl_usd),
    unrealized_pnl:
      num(pnl.unrealized_pnl_usd) === null
        ? null
        : signedUsd(pnl.unrealized_pnl_usd),
    daily_change:
      num(pnl.daily_change_usd) === null
        ? null
        : signedUsd(pnl.daily_change_usd),
    daily_change_pct:
      num(pnl.daily_change_pct) === null
        ? null
        : signedPct(pnl.daily_change_pct),
    mtd_pnl: num(pnl.mtd_pnl_usd) === null ? null : signedUsd(pnl.mtd_pnl_usd),
    ytd_pnl: num(pnl.ytd_pnl_usd) === null ? null : signedUsd(pnl.ytd_pnl_usd),
  };
  if (Array.isArray(pnl.by_asset)) {
    out.by_asset = pnl.by_asset.map((a) => ({
      asset: a.asset,
      net_pnl:
        num(a.net_pnl_usd) === null ? null : signedUsd(a.net_pnl_usd),
      daily_change:
        num(a.daily_change_usd) === null
          ? null
          : signedUsd(a.daily_change_usd),
      direction:
        num(a.net_pnl_usd) === null
          ? null
          : a.net_pnl_usd < 0
          ? "down"
          : "up",
    }));
  }
  return out;
}

// Optional `compliance` block -> pre-formatted strings for the breaches view.
function formatCompliance(compliance, fallbackStatus) {
  if (!compliance || typeof compliance !== "object") {
    return fallbackStatus ? { status: fallbackStatus } : null;
  }
  const out = {
    status: compliance.status ?? fallbackStatus ?? null,
    open_breach_count: compliance.open_breach_count ?? null,
    warning_count: compliance.warning_count ?? null,
    last_scan: compliance.last_scan ?? null,
  };
  if (Array.isArray(compliance.breaches)) {
    out.breaches = compliance.breaches.map((b) => ({
      id: b.id,
      rule: b.rule,
      severity: b.severity,
      status: b.status,
      asset: b.asset,
      detected_at: b.detected_at,
      description: b.description,
      limit: typeof b.limit_pct === "number" ? pct(b.limit_pct) : null,
      current: typeof b.current_pct === "number" ? pct(b.current_pct) : null,
    }));
  }
  return out;
}

function main() {
  const path = process.argv[2];
  if (!path) {
    console.error(
      "Usage: node parse_portfolio.mjs <path-to-portfolio.json>"
    );
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`Failed to read/parse ${path}: ${e.message}`);
    process.exit(1);
  }

  const errors = validate(parsed);
  if (errors.length > 0) {
    console.error("SCHEMA VALIDATION FAILED:");
    errors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  }

  const aum = parsed.metrics.total_aum_usd;
  const risk = weightedRisk(parsed.allocations);

  const result = {
    portfolio_id: parsed.portfolio_id,
    client_name: parsed.client_name,
    last_updated: parsed.last_updated,
    compliance_status: parsed.compliance_status,
    metrics: {
      total_aum: usd(aum),
      unrealized_pnl: usd(parsed.metrics.unrealized_pnl_usd),
      cash_reserve_ratio: pct(parsed.metrics.cash_reserve_ratio),
    },
    weighted_risk_score: Number(risk.toFixed(2)),
    allocations: parsed.allocations.map((a) => {
      const weight = a.value_usd / aum;
      const alloc = {
        asset: a.asset,
        value: usd(a.value_usd),
        weight_pct: `${(weight * 100).toFixed(1)}%`,
        risk_score: a.risk_score,
      };
      if (typeof a.target_pct === "number") {
        alloc.target_pct = `${(a.target_pct * 100).toFixed(1)}%`;
        // Drift = actual weight minus target; signed so the UI can flag
        // over-/under-weight positions against the mandate.
        alloc.drift_pct = signedPct(weight - a.target_pct);
      }
      return alloc;
    }),
  };

  const pnl = formatPnl(parsed.pnl);
  if (pnl) result.pnl = pnl;

  const compliance = formatCompliance(
    parsed.compliance,
    parsed.compliance_status
  );
  if (compliance) result.compliance = compliance;

  console.log(JSON.stringify(result, null, 2));
}

main();
