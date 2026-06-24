const portfolio = {
  portfolio_id: "PORT-9921-X",
  client_name: "Apex Global Asset Management",
  last_updated: "2026-06-23T15:30:00Z",
  compliance_status: "PASSING",
  metrics: {
    total_aum: "$125,000,000.00",
    unrealized_pnl: "$4,200,500.00",
    cash_reserve_ratio: "8.00%",
  },
  weighted_risk_score: 4.04,
  allocations: [
    {
      asset: "Equities",
      value: "$75,000,000.00",
      weight_pct: "60.0%",
      risk_score: 4,
      color: "#4C82FB",
      risk_label: "Moderate",
    },
    {
      asset: "Fixed Income",
      value: "$35,000,000.00",
      weight_pct: "28.0%",
      risk_score: 2,
      color: "#16C784",
      risk_label: "Low",
    },
    {
      asset: "Crypto/Digital Assets",
      value: "$15,000,000.00",
      weight_pct: "12.0%",
      risk_score: 9,
      color: "#F0A92E",
      risk_label: "Elevated",
    },
  ],
};

const riskBand =
  portfolio.weighted_risk_score >= 7
    ? "Elevated"
    : portfolio.weighted_risk_score >= 4
      ? "Moderate"
      : "Low";

const portfolioStats = [
  {
    label: "Total AUM",
    value: portfolio.metrics.total_aum,
    detail: "Validated USD",
    tone: "info",
  },
  {
    label: "Unrealized P&L",
    value: portfolio.metrics.unrealized_pnl,
    detail: "Gain: positive contribution",
    tone: "gain",
  },
  {
    label: "Cash Reserve",
    value: portfolio.metrics.cash_reserve_ratio,
    detail: "Portfolio liquidity",
    tone: "neutral",
  },
  {
    label: "Weighted Risk",
    value: portfolio.weighted_risk_score.toFixed(2),
    detail: `${riskBand} value-weighted score`,
    tone: "risk",
  },
];

const toneClasses: Record<string, string> = {
  gain: "text-[#16C784]",
  info: "text-[#4C82FB]",
  neutral: "text-[#E6E9EF]",
  risk: "text-[#F0A92E]",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0E14] px-4 py-4 text-[#E6E9EF] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-sm border border-[#222838] bg-[#161B26] px-4 py-3 shadow-[0_0_0_1px_rgba(76,130,251,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A93A6]">
                Institutional Portfolio View
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#E6E9EF]">
                {portfolio.client_name}
              </h1>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <dt className="text-[#8A93A6]">Portfolio ID</dt>
                <dd className="numeric text-[#E6E9EF]">{portfolio.portfolio_id}</dd>
              </div>
              <div>
                <dt className="text-[#8A93A6]">Last Updated</dt>
                <dd className="numeric text-[#E6E9EF]">{portfolio.last_updated}</dd>
              </div>
              <div>
                <dt className="text-[#8A93A6]">Compliance</dt>
                <dd className="numeric text-[#16C784]">
                  {portfolio.compliance_status}
                </dd>
              </div>
              <div>
                <dt className="text-[#8A93A6]">Source</dt>
                <dd className="numeric text-[#4C82FB]">mock_portfolio.json</dd>
              </div>
            </dl>
          </div>
        </header>

        <section
          aria-label="Validated portfolio metrics"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {portfolioStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-sm border border-[#222838] bg-[#161B26] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-[#8A93A6]">
                  {stat.label}
                </h2>
                <span className="h-1.5 w-1.5 rounded-full bg-[#4C82FB]" />
              </div>
              <p
                className={`numeric mt-3 text-2xl font-semibold leading-none ${toneClasses[stat.tone]}`}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-[#8A93A6]">{stat.detail}</p>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.9fr)]">
          <section className="rounded-sm border border-[#222838] bg-[#161B26]">
            <div className="border-b border-[#222838] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8A93A6]">
                Chart 01
              </p>
              <h2 className="mt-1 text-base font-semibold text-[#E6E9EF]">
                Allocation by Market Value
              </h2>
              <p className="mt-1 text-xs text-[#8A93A6]">
                Units: parser-formatted USD value and portfolio weight. Every
                segment is labeled by asset, value, weight, and risk score.
              </p>
            </div>

            <div className="p-4">
              <div
                aria-label="Allocation chart showing asset weights as percentage of total portfolio market value"
                className="space-y-3"
                role="img"
              >
                <div className="flex items-center justify-between border-b border-[#222838] pb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A93A6]">
                  <span>0%</span>
                  <span>Allocation Weight</span>
                  <span>100%</span>
                </div>
                {portfolio.allocations.map((allocation) => (
                  <div key={allocation.asset} className="grid gap-2">
                    <div className="grid grid-cols-[minmax(150px,1fr)_auto_auto] items-baseline gap-3 text-xs">
                      <span className="font-medium text-[#E6E9EF]">
                        {allocation.asset}
                      </span>
                      <span className="numeric text-right text-[#E6E9EF]">
                        {allocation.value}
                      </span>
                      <span className="numeric text-right text-[#8A93A6]">
                        {allocation.weight_pct}
                      </span>
                    </div>
                    <div className="h-5 rounded-sm border border-[#222838] bg-[#0F141F]">
                      <div
                        className="flex h-full items-center justify-end rounded-sm pr-2"
                        style={{
                          width: allocation.weight_pct,
                          backgroundColor: allocation.color,
                        }}
                      >
                        <span className="numeric text-[10px] font-semibold text-[#0B0E14]">
                          Risk {allocation.risk_score}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                {portfolio.allocations.map((allocation) => (
                  <div
                    key={`${allocation.asset}-legend`}
                    className="flex items-center justify-between gap-2 rounded-sm border border-[#222838] bg-[#0F141F] px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-[#8A93A6]">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: allocation.color }}
                      />
                      {allocation.asset}
                    </span>
                    <span className="numeric text-[#E6E9EF]">
                      {allocation.weight_pct}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-sm border border-[#222838]">
                <table className="w-full border-collapse text-xs">
                  <caption className="sr-only">
                    Allocation table with asset, value, weight, risk score, and
                    risk band
                  </caption>
                  <thead className="bg-[#0F141F] text-left uppercase tracking-[0.14em] text-[#8A93A6]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Asset</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Value
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Weight
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Risk
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Band
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.allocations.map((allocation) => (
                      <tr
                        key={`${allocation.asset}-row`}
                        className="border-t border-[#222838]"
                      >
                        <td className="px-3 py-2 text-[#E6E9EF]">
                          {allocation.asset}
                        </td>
                        <td className="numeric px-3 py-2 text-right text-[#E6E9EF]">
                          {allocation.value}
                        </td>
                        <td className="numeric px-3 py-2 text-right text-[#E6E9EF]">
                          {allocation.weight_pct}
                        </td>
                        <td className="numeric px-3 py-2 text-right text-[#F0A92E]">
                          {allocation.risk_score}/10
                        </td>
                        <td className="px-3 py-2 text-right text-[#8A93A6]">
                          {allocation.risk_label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
            <section className="rounded-sm border border-[#222838] bg-[#161B26]">
              <div className="border-b border-[#222838] px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8A93A6]">
                  Risk Panel
                </p>
                <h2 className="mt-1 text-base font-semibold text-[#E6E9EF]">
                  Value-Weighted Risk Score
                </h2>
              </div>
              <div className="p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="numeric text-5xl font-semibold leading-none text-[#F0A92E]">
                      {portfolio.weighted_risk_score.toFixed(2)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8A93A6]">
                      {riskBand} risk band
                    </p>
                  </div>
                  <div className="numeric text-right text-xs text-[#8A93A6]">
                    <p>Scale</p>
                    <p className="text-[#E6E9EF]">1.00 - 10.00</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between font-mono text-[10px] text-[#8A93A6]">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>Elevated</span>
                  </div>
                  <div className="relative h-4 rounded-sm border border-[#222838] bg-[#0F141F]">
                    <div className="absolute inset-y-0 left-0 w-[33.33%] bg-[#16C784]" />
                    <div className="absolute inset-y-0 left-[33.33%] w-[33.33%] bg-[#4C82FB]" />
                    <div className="absolute inset-y-0 left-[66.66%] w-[33.34%] bg-[#F0A92E]" />
                    <div
                      aria-label={`Weighted risk score ${portfolio.weighted_risk_score.toFixed(2)} out of 10`}
                      className="absolute -top-1 h-6 w-1 rounded-sm bg-[#E6E9EF]"
                      style={{
                        left: `calc(${portfolio.weighted_risk_score * 10}% - 2px)`,
                      }}
                    />
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-sm border border-[#222838] bg-[#0F141F] p-3">
                    <dt className="text-[#8A93A6]">Highest Risk Asset</dt>
                    <dd className="mt-1 text-[#E6E9EF]">
                      Crypto/Digital Assets
                    </dd>
                  </div>
                  <div className="rounded-sm border border-[#222838] bg-[#0F141F] p-3">
                    <dt className="text-[#8A93A6]">Risk Driver</dt>
                    <dd className="numeric mt-1 text-[#F0A92E]">
                      12.0% at 9/10
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-sm border border-[#222838] bg-[#161B26] p-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-[#8A93A6]">
                Compliance Snapshot
              </h2>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="rounded-sm border border-[#164C36] bg-[#0F2A22] px-2 py-1 text-xs font-semibold text-[#16C784]">
                  {portfolio.compliance_status}
                </span>
                <span className="numeric text-xs text-[#8A93A6]">
                  Parser validated
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#8A93A6]">
                Financial values shown on this dashboard are consumed from the
                portfolio parser output and are not re-rounded in the UI.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
