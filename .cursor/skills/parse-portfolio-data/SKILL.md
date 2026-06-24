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

Ratios are rendered as percentages (e.g. `0.08` -> `"8.00%"`). The parser already applies these rules; honor its output verbatim in any generated component.
