"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type Allocation = {
  asset: string;
  valueUsd: string;
  weightPct: string;
  share: number;
  riskScore: number;
  color: string;
};

type Segment = Allocation & {
  startAngle: number;
  endAngle: number;
  path: string;
};

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
  weightedRiskScore: 4.04,
  allocations: [
    {
      asset: "Equities",
      valueUsd: "$75,000,000.00",
      weightPct: "60.0%",
      share: 60,
      riskScore: 4,
      color: "#4C82FB",
    },
    {
      asset: "Fixed Income",
      valueUsd: "$35,000,000.00",
      weightPct: "28.0%",
      share: 28,
      riskScore: 2,
      color: "#16C784",
    },
    {
      asset: "Crypto/Digital Assets",
      valueUsd: "$15,000,000.00",
      weightPct: "12.0%",
      share: 12,
      riskScore: 9,
      color: "#F0A92E",
    },
  ] satisfies Allocation[],
};

const numberTextStyle = {
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
} as const;

const compactDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function riskTone(score: number) {
  if (score >= 8) {
    return {
      label: "Elevated",
      color: "#F0A92E",
      description: "Requires active monitoring and tighter exposure limits.",
    };
  }

  if (score >= 5) {
    return {
      label: "Moderate",
      color: "#4C82FB",
      description: "Balanced contribution to aggregate portfolio risk.",
    };
  }

  return {
    label: "Contained",
    color: "#16C784",
    description: "Lower volatility sleeve supporting capital preservation.",
  };
}

function makeSegments(allocations: Allocation[]): Segment[] {
  let cursor = 0;

  return allocations.map((allocation) => {
    const startAngle = cursor;
    const endAngle = cursor + allocation.share * 3.6;

    cursor = endAngle;

    return {
      ...allocation,
      startAngle,
      endAngle,
      path: describeArc(120, 120, 84, startAngle, endAngle),
    };
  });
}

export default function FinancialDashboard() {
  const [activeAsset, setActiveAsset] = useState(
    portfolio.allocations[0]?.asset ?? "",
  );
  const [chartMode, setChartMode] = useState<"allocation" | "risk">(
    "allocation",
  );

  const segments = useMemo(() => makeSegments(portfolio.allocations), []);
  const activeAllocation =
    portfolio.allocations.find((allocation) => allocation.asset === activeAsset) ??
    portfolio.allocations[0];
  const activeRisk = riskTone(activeAllocation.riskScore);
  const weightedRisk = riskTone(portfolio.weightedRiskScore);
  const updatedAt = compactDateFormatter.format(
    new Date(portfolio.lastUpdated),
  );
  const riskNeedleOffset = Math.min(
    100,
    Math.max(0, (portfolio.weightedRiskScore / 10) * 100),
  );

  return (
    <section className="min-h-screen bg-[#0B0E14] px-4 py-4 text-[#E6E9EF] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3">
        <header className="grid gap-3 border border-[#222838] bg-[#161B26] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] lg:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A93A6]">
              <span>Institutional Portfolio View</span>
              <span className="border border-[#222838] px-2 py-0.5 text-[#16C784]">
                Compliance {portfolio.complianceStatus}
              </span>
              <span className="border border-[#222838] px-2 py-0.5 text-[#8A93A6]">
                ID {portfolio.portfolioId}
              </span>
            </div>
            <h1 className="truncate text-2xl font-semibold tracking-[-0.03em] text-[#E6E9EF] sm:text-3xl">
              {portfolio.clientName}
            </h1>
            <p
              className="mt-1 text-xs text-[#8A93A6]"
              style={numberTextStyle}
            >
              Last portfolio snapshot: {updatedAt}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-right">
            <MetricTile label="Total AUM" value={portfolio.metrics.totalAum} />
            <MetricTile
              label="Unrealized P&L"
              value={`+${portfolio.metrics.unrealizedPnl}`}
              tone="positive"
            />
            <MetricTile
              label="Cash Reserve"
              value={portfolio.metrics.cashReserveRatio}
            />
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel
            eyebrow="Labeled Allocation Chart"
            title="Asset Allocation by Market Value"
            action={
              <div className="flex border border-[#222838] text-[10px] uppercase tracking-[0.14em]">
                <button
                  className={`px-2 py-1 ${
                    chartMode === "allocation"
                      ? "bg-[#4C82FB] text-[#E6E9EF]"
                      : "text-[#8A93A6] hover:text-[#E6E9EF]"
                  }`}
                  type="button"
                  onClick={() => setChartMode("allocation")}
                >
                  Weight
                </button>
                <button
                  className={`border-l border-[#222838] px-2 py-1 ${
                    chartMode === "risk"
                      ? "bg-[#F0A92E] text-[#0B0E14]"
                      : "text-[#8A93A6] hover:text-[#E6E9EF]"
                  }`}
                  type="button"
                  onClick={() => setChartMode("risk")}
                >
                  Risk
                </button>
              </div>
            }
          >
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="relative mx-auto h-[280px] w-[280px]">
                <svg
                  aria-label="Allocation donut chart in percent of portfolio market value"
                  className="h-full w-full"
                  role="img"
                  viewBox="0 0 240 240"
                >
                  <title>Portfolio Allocation Chart</title>
                  <desc>
                    Donut chart showing allocation percentages and risk scores
                    for Equities, Fixed Income, and Crypto/Digital Assets.
                  </desc>
                  <circle
                    cx="120"
                    cy="120"
                    fill="none"
                    r="84"
                    stroke="#222838"
                    strokeWidth="28"
                  />
                  {segments.map((segment) => {
                    const isActive = segment.asset === activeAllocation.asset;
                    const strokeWidth =
                      chartMode === "risk"
                        ? 16 + segment.riskScore * 1.6
                        : isActive
                          ? 34
                          : 26;

                    return (
                      <path
                        key={segment.asset}
                        aria-label={`${segment.asset}: ${segment.weightPct} allocation, risk score ${segment.riskScore} of 10`}
                        className="cursor-pointer transition-all duration-200"
                        d={segment.path}
                        fill="none"
                        opacity={isActive ? 1 : 0.58}
                        stroke={segment.color}
                        strokeLinecap="butt"
                        strokeWidth={strokeWidth}
                        tabIndex={0}
                        onClick={() => setActiveAsset(segment.asset)}
                        onFocus={() => setActiveAsset(segment.asset)}
                        onMouseEnter={() => setActiveAsset(segment.asset)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div
                      className="text-3xl font-semibold text-[#E6E9EF]"
                      style={numberTextStyle}
                    >
                      {activeAllocation.weightPct}
                    </div>
                    <div className="mt-1 max-w-[120px] text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
                      {activeAllocation.asset}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-3">
                <div className="grid grid-cols-[1fr_88px_124px_76px] border-y border-[#222838] text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
                  <span className="py-2">Asset</span>
                  <span className="py-2 text-right">Weight</span>
                  <span className="py-2 text-right">Value (USD)</span>
                  <span className="py-2 text-right">Risk</span>
                </div>
                {portfolio.allocations.map((allocation) => {
                  const isActive = allocation.asset === activeAllocation.asset;
                  const allocationTone = riskTone(allocation.riskScore);

                  return (
                    <button
                      key={allocation.asset}
                      className={`grid grid-cols-[1fr_88px_124px_76px] items-center border border-[#222838] px-3 py-2 text-left transition ${
                        isActive
                          ? "bg-[#20283A]"
                          : "bg-[#111722] hover:bg-[#1B2230]"
                      }`}
                      type="button"
                      onClick={() => setActiveAsset(allocation.asset)}
                      onMouseEnter={() => setActiveAsset(allocation.asset)}
                    >
                      <span className="flex items-center gap-2 text-xs font-medium text-[#E6E9EF]">
                        <span
                          className="h-2.5 w-2.5"
                          style={{ backgroundColor: allocation.color }}
                        />
                        {allocation.asset}
                      </span>
                      <span
                        className="text-right text-xs text-[#E6E9EF]"
                        style={numberTextStyle}
                      >
                        {allocation.weightPct}
                      </span>
                      <span
                        className="text-right text-xs text-[#E6E9EF]"
                        style={numberTextStyle}
                      >
                        {allocation.valueUsd}
                      </span>
                      <span
                        className="text-right text-xs font-semibold"
                        style={{
                          ...numberTextStyle,
                          color: allocationTone.color,
                        }}
                      >
                        {allocation.riskScore}/10
                      </span>
                    </button>
                  );
                })}
                <p className="text-[11px] leading-5 text-[#8A93A6]">
                  Units: allocation chart uses percent of total market value;
                  table values are parser-formatted USD strings.
                </p>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Risk Panel" title="Value-Weighted Risk Monitor">
            <div className="grid gap-3">
              <div className="border border-[#222838] bg-[#111722] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
                      Aggregate Risk Score
                    </div>
                    <div
                      className="mt-1 text-4xl font-semibold"
                      style={{ ...numberTextStyle, color: weightedRisk.color }}
                    >
                      {portfolio.weightedRiskScore.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
                      Scale
                    </div>
                    <div
                      className="text-sm text-[#E6E9EF]"
                      style={numberTextStyle}
                    >
                      1-10
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-[#222838]">
                  <div
                    className="h-full bg-[#F0A92E]"
                    style={{ width: `${riskNeedleOffset}%` }}
                  />
                </div>
                <div
                  className="mt-1 flex justify-between text-[10px] text-[#8A93A6]"
                  style={numberTextStyle}
                >
                  <span>1 Low</span>
                  <span>5 Medium</span>
                  <span>10 High</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <RiskStat
                  label="Focused Sleeve"
                  value={activeAllocation.asset}
                  helper={activeRisk.label}
                  color={activeRisk.color}
                />
                <RiskStat
                  label="Focused Risk"
                  value={`${activeAllocation.riskScore}/10`}
                  helper={activeRisk.description}
                  color={activeRisk.color}
                  numeric
                />
                <RiskStat
                  label="Focused Value"
                  value={activeAllocation.valueUsd}
                  helper={`${activeAllocation.weightPct} of portfolio`}
                  color="#4C82FB"
                  numeric
                />
                <RiskStat
                  label="Compliance"
                  value={portfolio.complianceStatus}
                  helper="No flagged breaches"
                  color="#16C784"
                />
              </div>

              <div className="border border-[#222838] bg-[#111722] p-3">
                <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
                  Risk Contribution Legend
                </div>
                <div className="grid gap-2">
                  {portfolio.allocations.map((allocation) => (
                    <button
                      key={allocation.asset}
                      className={`grid grid-cols-[1fr_52px] items-center gap-2 text-left text-xs ${
                        allocation.asset === activeAllocation.asset
                          ? "text-[#E6E9EF]"
                          : "text-[#8A93A6] hover:text-[#E6E9EF]"
                      }`}
                      type="button"
                      onClick={() => setActiveAsset(allocation.asset)}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-1.5"
                          style={{
                            width: `${allocation.riskScore * 8}px`,
                            backgroundColor: allocation.color,
                          }}
                        />
                        {allocation.asset}
                      </span>
                      <span className="text-right" style={numberTextStyle}>
                        {allocation.riskScore}/10
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive";
}) {
  return (
    <div className="border border-[#222838] bg-[#111722] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold sm:text-base ${
          tone === "positive" ? "text-[#16C784]" : "text-[#E6E9EF]"
        }`}
        style={numberTextStyle}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-[#222838] bg-[#161B26] p-3">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-[#222838] pb-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
            {eyebrow}
          </div>
          <h2 className="text-sm font-semibold text-[#E6E9EF]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function RiskStat({
  label,
  value,
  helper,
  color,
  numeric,
}: {
  label: string;
  value: string;
  helper: string;
  color: string;
  numeric?: boolean;
}) {
  return (
    <div className="min-h-[94px] border border-[#222838] bg-[#111722] p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
        {label}
      </div>
      <div
        className="mt-1 truncate text-sm font-semibold"
        style={{
          ...(numeric ? numberTextStyle : {}),
          color,
        }}
      >
        {value}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-[#8A93A6]">{helper}</p>
    </div>
  );
}
