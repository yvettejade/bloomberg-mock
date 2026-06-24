import portfolio from "./portfolio-dashboard-data.json";

const allocationColors: Record<string, string> = {
  Equities: "#4C82FB",
  "Fixed Income": "#16C784",
  "Crypto/Digital Assets": "#F0A92E",
};

const allocationNotes: Record<string, string> = {
  Equities: "Core growth sleeve",
  "Fixed Income": "Volatility ballast",
  "Crypto/Digital Assets": "Elevated risk sleeve",
};

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

export default function Home() {
  const updatedAt = formatTimestamp(portfolio.last_updated);

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="grid gap-3 border-b border-border pb-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-info">
              Institutional Portfolio View
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-[#E6E9EF] sm:text-3xl">
                {portfolio.client_name}
              </h1>
              <span className="number-cell rounded border border-border bg-panel px-2 py-0.5 text-xs text-muted">
                {portfolio.portfolio_id}
              </span>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded border border-border bg-panel px-3 py-2">
              <dt className="uppercase tracking-[0.18em] text-muted">Updated</dt>
              <dd className="number-cell mt-1 text-right text-[#E6E9EF]">{updatedAt} UTC</dd>
            </div>
            <div className="rounded border border-border bg-panel px-3 py-2">
              <dt className="uppercase tracking-[0.18em] text-muted">Compliance</dt>
              <dd className="mt-1 text-right font-semibold text-gain">
                {portfolio.compliance_status}
              </dd>
            </div>
            <div className="rounded border border-border bg-panel px-3 py-2">
              <dt className="uppercase tracking-[0.18em] text-muted">Risk Model</dt>
              <dd className="number-cell mt-1 text-right text-warning">Value-weighted</dd>
            </div>
          </dl>
        </header>

        <section
          aria-label="Portfolio headline metrics"
          className="grid gap-3 md:grid-cols-3"
        >
          <MetricCard
            label="Total AUM"
            value={portfolio.metrics.total_aum}
            description="Gross managed capital"
            tone="info"
          />
          <MetricCard
            label="Unrealized P&L"
            value={portfolio.metrics.unrealized_pnl}
            description="Open-position gain"
            tone="gain"
          />
          <MetricCard
            label="Cash Reserve Ratio"
            value={portfolio.metrics.cash_reserve_ratio}
            description="Liquidity buffer"
            tone="neutral"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.85fr)]">
          <AllocationPanel />
          <RiskPanel />
        </section>

        <section className="rounded-lg border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                Allocation Detail
              </h2>
              <p className="mt-1 text-xs text-muted">
                Values are parser-formatted USD strings from mock_portfolio.json.
              </p>
            </div>
            <span className="number-cell text-xs text-muted">
              {portfolio.allocations.length} sleeves
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-[#111722] text-xs uppercase tracking-[0.16em] text-muted">
                <tr>
                  <th className="border-b border-border px-4 py-2 text-left font-medium">
                    Sleeve
                  </th>
                  <th className="border-b border-border px-4 py-2 text-right font-medium">
                    Allocation Value
                  </th>
                  <th className="border-b border-border px-4 py-2 text-right font-medium">
                    Portfolio Weight
                  </th>
                  <th className="border-b border-border px-4 py-2 text-right font-medium">
                    Risk Score / 10
                  </th>
                  <th className="border-b border-border px-4 py-2 text-left font-medium">
                    Desk Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolio.allocations.map((allocation) => (
                  <tr
                    key={allocation.asset}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2 font-medium text-[#E6E9EF]">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-sm"
                        style={{
                          backgroundColor: allocationColors[allocation.asset],
                        }}
                        aria-hidden="true"
                      />
                      {allocation.asset}
                    </td>
                    <td className="number-cell px-4 py-2 text-right">
                      {allocation.value}
                    </td>
                    <td className="number-cell px-4 py-2 text-right text-info">
                      {allocation.weight_pct}
                    </td>
                    <td
                      className={`number-cell px-4 py-2 text-right ${
                        allocation.risk_score >= 8 ? "text-warning" : "text-muted"
                      }`}
                    >
                      {allocation.risk_score}
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {allocationNotes[allocation.asset]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: "gain" | "info" | "neutral";
}) {
  const toneClass =
    tone === "gain"
      ? "text-gain"
      : tone === "info"
        ? "text-info"
        : "text-[#E6E9EF]";

  return (
    <article className="rounded-lg border border-border bg-panel px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className={`number-cell mt-2 text-2xl font-semibold ${toneClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </article>
  );
}

function AllocationPanel() {
  return (
    <article className="rounded-lg border border-border bg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Labeled Allocation Chart
          </h2>
          <p className="mt-1 text-xs text-muted">
            X-axis: portfolio weight (%). Bar labels show parser weight and USD
            value.
          </p>
        </div>
        <div aria-label="Allocation legend" className="flex flex-wrap gap-2 text-xs">
          {portfolio.allocations.map((allocation) => (
            <span
              key={allocation.asset}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-[#111722] px-2 py-1 text-muted"
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: allocationColors[allocation.asset] }}
                aria-hidden="true"
              />
              {allocation.asset}
            </span>
          ))}
        </div>
      </div>

      <div
        className="mt-4 space-y-3"
        role="img"
        aria-label="Allocation bar chart showing Equities at 60.0%, Fixed Income at 28.0%, and Crypto/Digital Assets at 12.0% of portfolio weight."
      >
        <div className="number-cell grid grid-cols-5 border-b border-border pb-1 text-[0.65rem] text-muted">
          <span>0%</span>
          <span className="text-center">25%</span>
          <span className="text-center">50%</span>
          <span className="text-center">75%</span>
          <span className="text-right">100%</span>
        </div>
        {portfolio.allocations.map((allocation) => (
          <div
            key={allocation.asset}
            className="grid gap-2 md:grid-cols-[180px_1fr_170px]"
          >
            <div>
              <p className="text-sm font-medium">{allocation.asset}</p>
              <p className="number-cell text-xs text-muted">
                Risk {allocation.risk_score}/10
              </p>
            </div>
            <div className="relative h-9 overflow-hidden rounded border border-border bg-[#111722]">
              <div className="absolute inset-y-0 left-1/4 border-l border-[#2B3346]" />
              <div className="absolute inset-y-0 left-1/2 border-l border-[#2B3346]" />
              <div className="absolute inset-y-0 left-3/4 border-l border-[#2B3346]" />
              <div
                className="flex h-full items-center justify-end px-2"
                style={{
                  width: allocation.weight_pct,
                  backgroundColor: allocationColors[allocation.asset],
                }}
              >
                <span className="number-cell text-xs font-semibold text-[#10141D]">
                  {allocation.weight_pct}
                </span>
              </div>
            </div>
            <div className="number-cell self-center text-right text-sm">
              {allocation.value}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function RiskPanel() {
  return (
    <article className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Risk Panel
          </h2>
          <p className="mt-1 text-xs text-muted">
            Value-weighted score across allocation sleeves.
          </p>
        </div>
        <span className="rounded border border-warning/40 bg-[#2A2316] px-2 py-1 text-xs font-semibold text-warning">
          Moderate
        </span>
      </div>

      <div className="mt-5 rounded border border-border bg-[#111722] p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Weighted Risk Score
            </p>
            <p className="number-cell mt-1 text-5xl font-semibold text-warning">
              {portfolio.weighted_risk_score}
            </p>
          </div>
          <p className="number-cell pb-1 text-sm text-muted">/ 10.00</p>
        </div>
        <div
          className="mt-4 h-3 rounded-full bg-[#252D3D]"
          aria-label={`Weighted risk score ${portfolio.weighted_risk_score} out of 10`}
        >
          <div className="h-3 w-[40.4%] rounded-full bg-warning" />
        </div>
        <div className="number-cell mt-2 flex justify-between text-[0.65rem] text-muted">
          <span>0 low</span>
          <span>5 balanced</span>
          <span>10 high</span>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="grid grid-cols-[1fr_auto] rounded border border-border bg-[#111722] px-3 py-2">
          <dt className="text-muted">Largest sleeve</dt>
          <dd className="number-cell text-right text-info">Equities 60.0%</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] rounded border border-border bg-[#111722] px-3 py-2">
          <dt className="text-muted">Elevated-risk exposure</dt>
          <dd className="number-cell text-right text-warning">Crypto/Digital Assets 12.0%</dd>
        </div>
        <div className="grid grid-cols-[1fr_auto] rounded border border-border bg-[#111722] px-3 py-2">
          <dt className="text-muted">Liquidity reserve</dt>
          <dd className="number-cell text-right">{portfolio.metrics.cash_reserve_ratio}</dd>
        </div>
      </dl>
    </article>
  );
}
