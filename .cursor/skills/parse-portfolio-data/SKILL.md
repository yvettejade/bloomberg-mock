---
name: parse-portfolio-data
description: Parses portfolio JSON to extract metrics, validate the standard schema, and compute a dynamic value-weighted risk score, formatting all financial figures as standard USD strings. Use when reading mock_portfolio.json or any portfolio data, generating dashboard metrics, or working with AUM, P&L, or allocation data.
---

# Parse Portfolio Data

Turn a portfolio JSON file into validated, presentation-ready metrics for the dashboard.

## Workflow

1. **Run the parser** against the target file:

```bash
node .cursor/skills/parse-portfolio-data/scripts/parse_portfolio.mjs mock_portfolio.json
```

   It validates the schema, computes weighted risk, and prints a JSON object with every financial figure already formatted as a USD string. Prefer running it over re-implementing the logic by hand.

2. **If validation fails**, the script exits non-zero and lists the missing/invalid fields. Fix the data (or report the issue) before generating any UI — never render an invalid portfolio.

3. **Consume the parser output** to build UI components. Use the pre-formatted strings as-is; do not re-derive or re-round numbers in the component.

## Standard schema (required fields)

```jsonc
{
  "portfolio_id": "string",
  "client_name": "string",
  "last_updated": "ISO-8601 string",
  "compliance_status": "string",
  "metrics": {
    "total_aum_usd": "number",
    "unrealized_pnl_usd": "number",
    "cash_reserve_ratio": "number (0..1)"
  },
  "allocations": [
    { "asset": "string", "value_usd": "number", "risk_score": "number (1..10)" }
  ]
}
```

## Optional dashboard blocks

These power the high-density PM dashboard (Net PnL, live compliance/risk breaches,
allocation distributions). They are optional — the parser only emits a section when
the corresponding block is present — but when included, the parser formats them so
components never re-derive numbers.

```jsonc
{
  // Net PnL view. All *_usd fields are signed by the parser ("+$..." / "-$...").
  "pnl": {
    "net_pnl_usd": "number",
    "realized_pnl_usd": "number",
    "unrealized_pnl_usd": "number",
    "daily_change_usd": "number",
    "daily_change_pct": "number (ratio, e.g. -0.0061)",
    "mtd_pnl_usd": "number",
    "ytd_pnl_usd": "number",
    "by_asset": [
      { "asset": "string", "net_pnl_usd": "number", "daily_change_usd": "number" }
    ]
  },

  // Live compliance / risk breaches view.
  "compliance": {
    "status": "string",
    "open_breach_count": "number",
    "warning_count": "number",
    "last_scan": "ISO-8601 string",
    "breaches": [
      {
        "id": "string",
        "rule": "string",
        "severity": "CRITICAL | HIGH | MEDIUM | LOW",
        "status": "OPEN | WARNING | RESOLVED",
        "asset": "string",
        "limit_pct": "number (0..1) | null",
        "current_pct": "number (0..1) | null",
        "detected_at": "ISO-8601 string",
        "description": "string"
      }
    ]
  },

  // Per-allocation mandate target. When present, the parser also emits a signed
  // `drift_pct` (actual weight − target) so over-/under-weight positions are flagged.
  "allocations": [
    { "asset": "string", "value_usd": "number", "risk_score": "number", "target_pct": "number (0..1)" }
  ]
}
```

The parser output mirrors these blocks with pre-formatted strings: signed USD for
P&L (`net_pnl`, `daily_change`, per-asset `net_pnl` + `direction`), signed percent
for `daily_change_pct` and allocation `drift_pct`, and `limit`/`current` percentages
on each breach. Honor them verbatim — do not re-sign, re-round, or re-format.

## Dynamic weighted risk

Risk is **value-weighted**, not a simple average, so it recalculates as allocations change:

```
weighted_risk = Σ(risk_scoreᵢ × value_usdᵢ) / Σ(value_usdᵢ)
```

Report it rounded to 2 decimals.

## USD formatting (mandatory)

All financial figures (AUM, P&L, allocation values, any dollar amount) **MUST** be rendered as standard USD strings — never bare numbers. Use:

```js
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
// 125000000 -> "$125,000,000.00"
```

Ratios are rendered as percentages (e.g. `0.08` -> `"8.00%"`). P&L and delta fields
(net/daily PnL, `daily_change_pct`, allocation `drift_pct`) are rendered **signed**
(e.g. `"-$312,750.00"`, `"+2.00%"`) so direction is unambiguous. The parser already
applies these rules; honor its output verbatim in any generated component.
