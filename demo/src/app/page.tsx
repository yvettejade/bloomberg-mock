const portfolio = {
  portfolioId: "PORT-9921-X",
  clientName: "Apex Global Asset Management",
  lastUpdated: "2026-06-23T15:30:00Z",
  complianceStatus: "PASSING",
  metrics: {
    totalAum: "$125,000,000.00",
    unrealizedPnl: "$4,200,500.00",
    cashReserveRatio: "8.00%",
  },
  weightedRiskScore: "4.04",
  weightedRiskPct: "40.4%",
  allocations: [
    {
      asset: "Equities",
      value: "$75,000,000.00",
      weightPct: "60.0%",
      riskScore: 4,
      color: "#4C82FB",
      riskTone: "Medium",
    },
    {
      asset: "Fixed Income",
      value: "$35,000,000.00",
      weightPct: "28.0%",
      riskScore: 2,
      color: "#16C784",
      riskTone: "Low",
    },
    {
      asset: "Crypto/Digital Assets",
      value: "$15,000,000.00",
      weightPct: "12.0%",
      riskScore: 9,
      color: "#F0A92E",
      riskTone: "Elevated",
    },
  ],
};

const metricCards = [
  {
    label: "Total AUM",
    value: portfolio.metrics.totalAum,
    caption: "Gross market value",
    tone: "text-foreground",
  },
  {
    label: "Unrealized P&L",
    value: portfolio.metrics.unrealizedPnl,
    caption: "Gain / open position",
    tone: "text-up",
  },
  {
    label: "Cash Reserve",
    value: portfolio.metrics.cashReserveRatio,
    caption: "Liquidity buffer",
    tone: "text-info",
  },
  {
    label: "Weighted Risk",
    value: portfolio.weightedRiskScore,
    caption: "Value-weighted score / 10",
    tone: "text-warning",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-lg border border-border bg-panel px-4 py-3 shadow-[0_18px_60px_rgba(5,8,14,0.28)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-info">
                Institutional Portfolio View
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {portfolio.clientName}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted">
                Portfolio {portfolio.portfolioId} / Updated{" "}
                {portfolio.lastUpdated}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <StatusPill label="Compliance" value={portfolio.complianceStatus} />
              <StatusPill label="Risk Model" value="VALUE-WEIGHTED" />
              <StatusPill label="Currency" value="USD" />
            </div>
          </div>
        </header>

        <section
          aria-label="Portfolio metrics"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {metricCards.map((metric) => (
            <div
              className="rounded-lg border border-border bg-panel px-4 py-3"
              key={metric.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {metric.label}
                </p>
                <span className="h-1.5 w-1.5 rounded-full bg-info" />
              </div>
              <p className={`numeric mt-2 text-2xl font-semibold ${metric.tone}`}>
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted">{metric.caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <AllocationPanel />
          <RiskPanel />
        </section>
      </div>
    </main>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-panel-2 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="numeric mt-1 text-right text-xs font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function AllocationPanel() {
  return (
    <section className="rounded-lg border border-border bg-panel p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Portfolio Allocation by Market Value
          </h2>
          <p className="mt-1 text-xs text-muted">
            Units: percent of total AUM; allocation values shown in USD.
          </p>
        </div>
        <p className="numeric text-sm font-semibold text-muted">
          Total {portfolio.metrics.totalAum}
        </p>
      </div>

      <div
        aria-label="Allocation chart showing Equities 60.0%, Fixed Income 28.0%, and Crypto/Digital Assets 12.0%"
        className="mt-4"
        role="img"
      >
        <div className="flex h-14 overflow-hidden rounded-md border border-border bg-panel-2">
          {portfolio.allocations.map((allocation) => (
            <div
              className="flex min-w-0 flex-col justify-center border-r border-background px-3 last:border-r-0"
              key={allocation.asset}
              style={{
                backgroundColor: allocation.color,
                width: allocation.weightPct,
              }}
              title={`${allocation.asset}: ${allocation.weightPct} / ${allocation.value}`}
            >
              <span className="truncate text-[11px] font-semibold text-[#10141D]">
                {allocation.asset}
              </span>
              <span className="numeric text-sm font-bold text-[#10141D]">
                {allocation.weightPct}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" aria-label="Chart legend">
          {portfolio.allocations.map((allocation) => (
            <div
              className="rounded-md border border-border bg-panel-2 px-3 py-2"
              key={allocation.asset}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: allocation.color }}
                />
                <p className="truncate text-xs font-semibold">
                  {allocation.asset}
                </p>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="numeric text-lg font-semibold">
                  {allocation.weightPct}
                </span>
                <span className="numeric text-right text-xs text-muted">
                  {allocation.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Allocation table with asset, market value, allocation weight, and
            risk score.
          </caption>
          <thead className="bg-panel-2 text-[11px] uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Asset</th>
              <th className="px-3 py-2 text-right font-semibold">
                Market Value
              </th>
              <th className="px-3 py-2 text-right font-semibold">
                Weight
              </th>
              <th className="px-3 py-2 text-right font-semibold">
                Risk / 10
              </th>
            </tr>
          </thead>
          <tbody>
            {portfolio.allocations.map((allocation) => (
              <tr
                className="border-t border-border text-xs hover:bg-panel-2"
                key={allocation.asset}
              >
                <td className="px-3 py-2 font-medium">{allocation.asset}</td>
                <td className="numeric px-3 py-2 text-right">
                  {allocation.value}
                </td>
                <td className="numeric px-3 py-2 text-right">
                  {allocation.weightPct}
                </td>
                <td className="numeric px-3 py-2 text-right">
                  <span
                    className={
                      allocation.riskScore >= 8
                        ? "text-warning"
                        : "text-muted"
                    }
                  >
                    {allocation.riskScore} ({allocation.riskTone})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RiskPanel() {
  const elevatedAllocation = portfolio.allocations.find(
    (allocation) => allocation.riskTone === "Elevated",
  );

  return (
    <aside className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Risk Panel
          </h2>
          <p className="mt-1 text-xs text-muted">Value-weighted exposure score.</p>
        </div>
        <span className="rounded border border-warning/50 bg-warning/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-warning">
          Watch
        </span>
      </div>

      <div className="mt-4 rounded-md border border-border bg-panel-2 p-3">
        <div className="flex items-end justify-between">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Weighted Risk
          </p>
          <p className="numeric text-3xl font-semibold text-warning">
            {portfolio.weightedRiskScore}
          </p>
        </div>
        <div className="mt-3">
          <div className="flex justify-between font-mono text-[10px] text-muted">
            <span>1 Low</span>
            <span>10 High</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-background">
            <div
              aria-label={`Weighted risk score ${portfolio.weightedRiskScore} out of 10`}
              className="h-2 rounded-full bg-warning"
              style={{ width: portfolio.weightedRiskPct }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <RiskFact label="Risk methodology" value="Value-weighted by allocation" />
        <RiskFact
          label="Elevated concentration"
          value={
            elevatedAllocation
              ? `${elevatedAllocation.asset} / ${elevatedAllocation.weightPct}`
              : "None"
          }
        />
        <RiskFact label="Compliance state" value={portfolio.complianceStatus} />
      </div>

      <div className="mt-4 rounded-md border border-border bg-panel-2 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Risk Notes
        </h3>
        <ul className="mt-2 space-y-2 text-xs leading-5 text-foreground">
          <li>
            <span className="font-semibold text-warning">Elevated:</span>{" "}
            Crypto/Digital Assets carry the highest risk score at{" "}
            <span className="numeric font-semibold">9</span>.
          </li>
          <li>
            <span className="font-semibold text-info">Offset:</span> Fixed
            Income anchors{" "}
            <span className="numeric font-semibold">28.0%</span> of the
            portfolio at risk score <span className="numeric font-semibold">2</span>.
          </li>
          <li>
            <span className="font-semibold text-up">Positive P&L:</span>{" "}
            Unrealized gains stand at{" "}
            <span className="numeric font-semibold">
              {portfolio.metrics.unrealizedPnl}
            </span>
            .
          </li>
        </ul>
      </div>
    </aside>
  );
}

function RiskFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-panel-2 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="numeric text-right text-xs font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
