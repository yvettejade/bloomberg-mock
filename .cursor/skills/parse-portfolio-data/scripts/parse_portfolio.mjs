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
    allocations: parsed.allocations.map((a) => ({
      asset: a.asset,
      value: usd(a.value_usd),
      weight_pct: `${((a.value_usd / aum) * 100).toFixed(1)}%`,
      risk_score: a.risk_score,
    })),
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
