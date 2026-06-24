"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Allocation = {
  asset: string;
  value: string;
  weightPct: string;
  weight: number;
  riskScore: number;
  color: string;
};

const numericStyle: CSSProperties = {
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
};

const portfolio = {
  portfolioId: "PORT-9921-X",
  clientName: "Apex Global Asset Management",
  lastUpdated: "2026-06-23T15:30:00Z",
  complianceStatus: "PASSING",
  weightedRiskScore: 4.04,
  metrics: {
    totalAum: "$125,000,000.00",
    unrealizedPnl: "$4,200,500.00",
    cashReserveRatio: "8.00%",
  },
  allocations: [
    {
      asset: "Equities",
      value: "$75,000,000.00",
      weightPct: "60.0%",
      weight: 60,
      riskScore: 4,
      color: "#4C82FB",
    },
    {
      asset: "Fixed Income",
      value: "$35,000,000.00",
      weightPct: "28.0%",
      weight: 28,
      riskScore: 2,
      color: "#16C784",
    },
    {
      asset: "Crypto/Digital Assets",
      value: "$15,000,000.00",
      weightPct: "12.0%",
      weight: 12,
      riskScore: 9,
      color: "#F0A92E",
    },
  ] satisfies Allocation[],
};

const lastUpdatedDisplay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
}).format(new Date(portfolio.lastUpdated));

function getRiskBand(score: number) {
  if (score >= 7) {
    return { label: "Elevated", color: "#F0A92E" };
  }

  if (score >= 4) {
    return { label: "Moderate", color: "#4C82FB" };
  }

  return { label: "Low", color: "#16C784" };
}

function MetricCard({
  label,
  value,
  detail,
  tone = "#8A93A6",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <section className="border border-[#222838] bg-[#161B26] px-3 py-2">
      <div className="flex items-center justify-between gap-4 border-b border-[#222838] pb-1 text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
        <span>{label}</span>
        <span aria-hidden="true" style={{ color: tone }}>
          ●
        </span>
      </div>
      <div
        className="mt-2 text-right text-xl font-semibold leading-none text-[#E6E9EF]"
        style={numericStyle}
      >
        {value}
      </div>
      <div className="mt-1 text-right text-[11px] text-[#8A93A6]">{detail}</div>
    </section>
  );
}

export default function FinancialDashboard() {
  const [selectedAsset, setSelectedAsset] = useState(
    portfolio.allocations[0].asset,
  );
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [riskLens, setRiskLens] = useState<"portfolio" | "allocation">(
    "portfolio",
  );

  const activeAssetName = hoveredAsset ?? selectedAsset;
  const activeAllocation =
    portfolio.allocations.find((allocation) => allocation.asset === activeAssetName) ??
    portfolio.allocations[0];
  const panelRiskScore =
    riskLens === "portfolio"
      ? portfolio.weightedRiskScore
      : activeAllocation.riskScore;
  const riskBand = getRiskBand(panelRiskScore);
  const riskFill = `${Math.min(panelRiskScore * 10, 100)}%`;

  const allocationRows = useMemo(
    () =>
      portfolio.allocations.map((allocation) => ({
        ...allocation,
        riskBand: getRiskBand(allocation.riskScore),
      })),
    [],
  );

  return (
    <main className="min-h-screen bg-[#0B0E14] p-4 text-[#E6E9EF] sm:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <header className="border border-[#222838] bg-[#161B26] px-4 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8A93A6]">
                Institutional Portfolio View
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#E6E9EF]">
                {portfolio.clientName}
              </h1>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <dt className="text-[#8A93A6]">Portfolio</dt>
                <dd className="text-right text-[#E6E9EF]" style={numericStyle}>
                  {portfolio.portfolioId}
                </dd>
              </div>
              <div>
                <dt className="text-[#8A93A6]">Updated</dt>
                <dd className="text-right text-[#E6E9EF]" style={numericStyle}>
                  {lastUpdatedDisplay}
                </dd>
              </div>
              <div>
                <dt className="text-[#8A93A6]">Compliance</dt>
                <dd className="text-right text-[#16C784]">
                  {portfolio.complianceStatus}
                </dd>
              </div>
              <div>
                <dt className="text-[#8A93A6]">Risk</dt>
                <dd className="text-right" style={{ ...numericStyle, color: riskBand.color }}>
                  {panelRiskScore.toFixed(2)} / 10
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard
            label="Total AUM"
            value={portfolio.metrics.totalAum}
            detail="Gross managed assets"
            tone="#4C82FB"
          />
          <MetricCard
            label="Unrealized P&L"
            value={`+${portfolio.metrics.unrealizedPnl}`}
            detail="Open gain across positions"
            tone="#16C784"
          />
          <MetricCard
            label="Cash Reserve"
            value={portfolio.metrics.cashReserveRatio}
            detail="Liquidity buffer"
            tone="#8A93A6"
          />
        </section>

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="border border-[#222838] bg-[#161B26] p-3">
            <div className="flex flex-col gap-1 border-b border-[#222838] pb-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#E6E9EF]">
                  Allocation by Asset Class
                </h2>
                <p className="text-xs text-[#8A93A6]">
                  Unit: percent of total AUM. Select a segment to focus the risk
                  panel.
                </p>
              </div>
              <div className="text-right text-[11px] text-[#8A93A6]">
                Axis: <span style={numericStyle}>0%</span> to{" "}
                <span style={numericStyle}>100%</span>
              </div>
            </div>

            <div
              className="mt-3 flex h-12 overflow-hidden border border-[#222838] bg-[#0B0E14]"
              role="img"
              aria-label="Stacked allocation chart showing Equities 60.0%, Fixed Income 28.0%, and Crypto/Digital Assets 12.0% of AUM."
            >
              {portfolio.allocations.map((allocation) => {
                const isActive = allocation.asset === activeAllocation.asset;

                return (
                  <button
                    key={allocation.asset}
                    type="button"
                    className="group relative flex min-w-0 items-center justify-center border-r border-[#0B0E14] text-[11px] font-semibold outline-none transition-[filter,transform] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[#E6E9EF]"
                    style={{
                      width: `${allocation.weight}%`,
                      background: allocation.color,
                      filter: isActive ? "brightness(1.1)" : "brightness(0.72)",
                      transform: isActive ? "scaleY(1)" : "scaleY(0.88)",
                    }}
                    onClick={() => setSelectedAsset(allocation.asset)}
                    onMouseEnter={() => setHoveredAsset(allocation.asset)}
                    onMouseLeave={() => setHoveredAsset(null)}
                    onFocus={() => setHoveredAsset(allocation.asset)}
                    onBlur={() => setHoveredAsset(null)}
                    aria-pressed={allocation.asset === selectedAsset}
                    aria-label={`${allocation.asset}: ${allocation.weightPct} of AUM, ${allocation.value}, risk score ${allocation.riskScore} out of 10`}
                  >
                    <span
                      className="truncate px-2 text-[#0B0E14]"
                      style={numericStyle}
                    >
                      {allocation.weightPct}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-1 grid grid-cols-5 text-[10px] text-[#8A93A6]">
              {["0%", "25%", "50%", "75%", "100%"].map((tick) => (
                <span
                  key={tick}
                  className="border-l border-[#222838] pl-1 last:text-right"
                  style={numericStyle}
                >
                  {tick}
                </span>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Allocation chart legend">
              {allocationRows.map((allocation) => (
                <button
                  key={allocation.asset}
                  type="button"
                  className="flex items-center justify-between gap-2 border border-[#222838] bg-[#0B0E14] px-2 py-1 text-left text-xs outline-none transition-colors hover:border-[#4C82FB] focus-visible:ring-2 focus-visible:ring-[#E6E9EF]"
                  onClick={() => setSelectedAsset(allocation.asset)}
                  onMouseEnter={() => setHoveredAsset(allocation.asset)}
                  onMouseLeave={() => setHoveredAsset(null)}
                  onFocus={() => setHoveredAsset(allocation.asset)}
                  onBlur={() => setHoveredAsset(null)}
                  aria-pressed={allocation.asset === selectedAsset}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0"
                      style={{ background: allocation.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[#E6E9EF]">{allocation.asset}</span>
                  </span>
                  <span className="text-right text-[#8A93A6]" style={numericStyle}>
                    {allocation.weightPct}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 overflow-hidden border border-[#222838]">
              <div className="grid grid-cols-[1.3fr_1fr_0.7fr_0.8fr] bg-[#0B0E14] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
                <span>Asset</span>
                <span className="text-right">Value USD</span>
                <span className="text-right">Weight</span>
                <span className="text-right">Risk</span>
              </div>
              {allocationRows.map((allocation) => (
                <button
                  key={allocation.asset}
                  type="button"
                  className="grid w-full grid-cols-[1.3fr_1fr_0.7fr_0.8fr] border-t border-[#222838] px-2 py-1.5 text-xs outline-none transition-colors hover:bg-[#1C2230] focus-visible:bg-[#1C2230] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E6E9EF]"
                  onClick={() => setSelectedAsset(allocation.asset)}
                  aria-pressed={allocation.asset === selectedAsset}
                >
                  <span className="truncate text-left text-[#E6E9EF]">
                    {allocation.asset}
                  </span>
                  <span className="text-right text-[#E6E9EF]" style={numericStyle}>
                    {allocation.value}
                  </span>
                  <span className="text-right text-[#E6E9EF]" style={numericStyle}>
                    {allocation.weightPct}
                  </span>
                  <span
                    className="text-right"
                    style={{ ...numericStyle, color: allocation.riskBand.color }}
                  >
                    {allocation.riskScore} / 10 {allocation.riskBand.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <aside className="border border-[#222838] bg-[#161B26] p-3">
            <div className="flex items-start justify-between gap-3 border-b border-[#222838] pb-2">
              <div>
                <h2 className="text-sm font-semibold text-[#E6E9EF]">Risk Panel</h2>
                <p className="text-xs text-[#8A93A6]">
                  Value-weighted score with interactive asset focus.
                </p>
              </div>
              <div className="flex border border-[#222838] bg-[#0B0E14] p-0.5 text-[10px] uppercase tracking-[0.12em]">
                {(["portfolio", "allocation"] as const).map((lens) => (
                  <button
                    key={lens}
                    type="button"
                    className="px-2 py-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#E6E9EF]"
                    style={{
                      background: riskLens === lens ? "#222838" : "transparent",
                      color: riskLens === lens ? "#E6E9EF" : "#8A93A6",
                    }}
                    onClick={() => setRiskLens(lens)}
                    aria-pressed={riskLens === lens}
                  >
                    {lens}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 border border-[#222838] bg-[#0B0E14] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.16em] text-[#8A93A6]">
                  {riskLens === "portfolio" ? "Weighted Risk" : activeAllocation.asset}
                </span>
                <span
                  className="text-lg font-semibold"
                  style={{ ...numericStyle, color: riskBand.color }}
                >
                  {panelRiskScore.toFixed(2)} / 10
                </span>
              </div>
              <div
                className="mt-2 h-3 border border-[#222838] bg-[#161B26]"
                aria-label={`Risk score ${panelRiskScore.toFixed(2)} out of 10, ${riskBand.label}`}
              >
                <div
                  className="h-full"
                  style={{ width: riskFill, background: riskBand.color }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#8A93A6]">
                <span style={numericStyle}>0 Low</span>
                <span style={numericStyle}>5 Moderate</span>
                <span style={numericStyle}>10 Elevated</span>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden border border-[#222838] bg-[#222838] text-xs">
              <div className="bg-[#0B0E14] p-2">
                <dt className="text-[#8A93A6]">Focused Asset</dt>
                <dd className="mt-1 text-[#E6E9EF]">{activeAllocation.asset}</dd>
              </div>
              <div className="bg-[#0B0E14] p-2">
                <dt className="text-[#8A93A6]">Focused Value</dt>
                <dd className="mt-1 text-right text-[#E6E9EF]" style={numericStyle}>
                  {activeAllocation.value}
                </dd>
              </div>
              <div className="bg-[#0B0E14] p-2">
                <dt className="text-[#8A93A6]">Focused Weight</dt>
                <dd className="mt-1 text-right text-[#E6E9EF]" style={numericStyle}>
                  {activeAllocation.weightPct}
                </dd>
              </div>
              <div className="bg-[#0B0E14] p-2">
                <dt className="text-[#8A93A6]">Focused Risk</dt>
                <dd
                  className="mt-1 text-right"
                  style={{
                    ...numericStyle,
                    color: getRiskBand(activeAllocation.riskScore).color,
                  }}
                >
                  {activeAllocation.riskScore} / 10{" "}
                  {getRiskBand(activeAllocation.riskScore).label}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border border-[#222838] bg-[#0B0E14] p-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A93A6]">
                Controls
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#E6E9EF]">
                Click chart segments, legend items, or allocation rows to lock an
                asset focus. Hovering temporarily previews another allocation
                without changing the selected state.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
