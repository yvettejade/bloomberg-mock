"use client";

import { useMemo, useState } from "react";

type Allocation = {
  asset: string;
  value: string;
  valueUsd: number;
  riskScore: number;
  weightPct: string;
  weight: number;
  targetPct: string;
  target: number;
  driftPct: string;
  drift: number;
};

type PnlAsset = {
  asset: string;
  netPnl: string;
  dailyChange: string;
  dailyChangeUsd: number;
  direction: "up" | "down" | "flat";
};

type Breach = {
  id: string;
  rule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "OPEN" | "WARNING";
  asset: string;
  limit: string | null;
  current: string | null;
  detectedAt: string;
  description: string;
};

type ViewKey = "allocations" | "pnl" | "compliance";
type SortKey = "asset" | "valueUsd" | "weight" | "riskScore" | "drift";
type SortDirection = "asc" | "desc";
type SeverityFilter = "ALL" | Breach["severity"];

const portfolio = {
  portfolioId: "PORT-9921-X",
  clientName: "Apex Global Asset Management",
  lastUpdated: "2026-06-23T15:30:00Z",
  complianceStatus: "ACTION_REQUIRED",
  metrics: {
    totalAum: "$125,000,000.00",
    unrealizedPnl: "+$4,200,500.00",
    cashReserveRatio: "8.00%",
    weightedRisk: 4.1,
  },
  pnl: {
    netPnl: "+$5,180,500.00",
    realizedPnl: "+$980,000.00",
    unrealizedPnl: "+$4,200,500.00",
    dailyChange: "-$312,750.00",
    dailyChangePct: "-0.61%",
    mtdPnl: "+$2,870,300.00",
    ytdPnl: "+$11,450,900.00",
  },
  compliance: {
    status: "ACTION_REQUIRED",
    openBreachCount: 2,
    warningCount: 1,
    lastScan: "2026-06-23T15:28:00Z",
  },
};

const allocations: Allocation[] = [
  {
    asset: "Equities",
    value: "$60,000,000.00",
    valueUsd: 60000000,
    riskScore: 4,
    weightPct: "48.00%",
    weight: 48,
    targetPct: "50.00%",
    target: 50,
    driftPct: "-2.00%",
    drift: -2,
  },
  {
    asset: "Fixed Income",
    value: "$35,000,000.00",
    valueUsd: 35000000,
    riskScore: 2,
    weightPct: "28.00%",
    weight: 28,
    targetPct: "28.00%",
    target: 28,
    driftPct: "+0.00%",
    drift: 0,
  },
  {
    asset: "Crypto/Digital Assets",
    value: "$15,000,000.00",
    valueUsd: 15000000,
    riskScore: 9,
    weightPct: "12.00%",
    weight: 12,
    targetPct: "10.00%",
    target: 10,
    driftPct: "+2.00%",
    drift: 2,
  },
  {
    asset: "Real Estate",
    value: "$8,000,000.00",
    valueUsd: 8000000,
    riskScore: 5,
    weightPct: "6.40%",
    weight: 6.4,
    targetPct: "7.00%",
    target: 7,
    driftPct: "-0.60%",
    drift: -0.6,
  },
  {
    asset: "Commodities",
    value: "$4,000,000.00",
    valueUsd: 4000000,
    riskScore: 6,
    weightPct: "3.20%",
    weight: 3.2,
    targetPct: "3.00%",
    target: 3,
    driftPct: "+0.20%",
    drift: 0.2,
  },
  {
    asset: "Cash",
    value: "$3,000,000.00",
    valueUsd: 3000000,
    riskScore: 1,
    weightPct: "2.40%",
    weight: 2.4,
    targetPct: "2.00%",
    target: 2,
    driftPct: "+0.40%",
    drift: 0.4,
  },
];

const pnlByAsset: PnlAsset[] = [
  {
    asset: "Equities",
    netPnl: "+$3,120,000.00",
    dailyChange: "-$210,500.00",
    dailyChangeUsd: -210500,
    direction: "down",
  },
  {
    asset: "Fixed Income",
    netPnl: "+$640,500.00",
    dailyChange: "+$18,750.00",
    dailyChangeUsd: 18750,
    direction: "up",
  },
  {
    asset: "Crypto/Digital Assets",
    netPnl: "+$1,980,000.00",
    dailyChange: "-$145,000.00",
    dailyChangeUsd: -145000,
    direction: "down",
  },
  {
    asset: "Real Estate",
    netPnl: "+$215,000.00",
    dailyChange: "+$9,500.00",
    dailyChangeUsd: 9500,
    direction: "up",
  },
  {
    asset: "Commodities",
    netPnl: "-$775,000.00",
    dailyChange: "+$14,500.00",
    dailyChangeUsd: 14500,
    direction: "up",
  },
];

const breaches: Breach[] = [
  {
    id: "BRC-1042",
    rule: "Single-Asset Concentration Limit",
    severity: "CRITICAL",
    status: "OPEN",
    asset: "Crypto/Digital Assets",
    limit: "10.00%",
    current: "12.00%",
    detectedAt: "2026-06-23T14:55:00Z",
    description:
      "Crypto/Digital Assets allocation of 12.0% exceeds the 10.0% mandate ceiling.",
  },
  {
    id: "BRC-1043",
    rule: "Minimum Cash Reserve",
    severity: "HIGH",
    status: "OPEN",
    asset: "Cash",
    limit: "10.00%",
    current: "8.00%",
    detectedAt: "2026-06-23T15:10:00Z",
    description:
      "Cash reserve ratio of 8.0% is below the required 10.0% liquidity floor.",
  },
  {
    id: "BRC-1044",
    rule: "Portfolio Risk Score Ceiling",
    severity: "MEDIUM",
    status: "WARNING",
    asset: "Portfolio",
    limit: null,
    current: null,
    detectedAt: "2026-06-23T15:12:00Z",
    description:
      "Value-weighted risk score is trending toward the 4.0 advisory threshold.",
  },
];

const viewLabels: Record<ViewKey, string> = {
  allocations: "Allocation",
  pnl: "P/L",
  compliance: "Compliance",
};

const severityFilters: SeverityFilter[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function toneClass(value: number) {
  if (value > 0) return "text-[#4FF5A7]";
  if (value < 0) return "text-[#FF5B6B]";
  return "text-[#A9B4C7]";
}

function sortAllocations(
  rows: Allocation[],
  sortKey: SortKey,
  sortDirection: SortDirection,
) {
  return [...rows].sort((a, b) => {
    const left = a[sortKey];
    const right = b[sortKey];
    const comparison =
      typeof left === "string" && typeof right === "string"
        ? left.localeCompare(right)
        : Number(left) - Number(right);

    return sortDirection === "asc" ? comparison : comparison * -1;
  });
}

function MetricCard({
  label,
  value,
  detail,
  intent = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  intent?: "neutral" | "positive" | "negative" | "warning";
}) {
  return (
    <div className="border border-[#283142] bg-[#161B26] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7F8CA3]">
          {label}
        </span>
        <span
          className={cx(
            "h-1.5 w-1.5 rounded-full",
            intent === "positive" && "bg-[#4FF5A7]",
            intent === "negative" && "bg-[#FF5B6B]",
            intent === "warning" && "bg-[#FFB020]",
            intent === "neutral" && "bg-[#8FA3C6]",
          )}
        />
      </div>
      <div
        className={cx(
          "mt-2 font-mono text-xl font-semibold leading-none tracking-[-0.04em] tabular-nums",
          intent === "positive" && "text-[#4FF5A7]",
          intent === "negative" && "text-[#FF5B6B]",
          intent === "warning" && "text-[#FFB020]",
          intent === "neutral" && "text-[#EEF3FF]",
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#6F7A8E]">
        {detail}
      </div>
    </div>
  );
}

function SortButton({
  label,
  sortKey,
  activeSortKey,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === activeSortKey;

  return (
    <button
      className={cx(
        "flex w-full items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8CA3] transition hover:text-[#EEF3FF]",
        align === "right" && "justify-end text-right",
      )}
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <span className={cx("font-mono", active ? "text-[#FFB020]" : "text-[#4D596D]")}>
        {active ? (direction === "asc" ? "ASC" : "DESC") : "--"}
      </span>
    </button>
  );
}

export default function FinancialDashboard() {
  const [activeView, setActiveView] = useState<ViewKey>("allocations");
  const [selectedAsset, setSelectedAsset] = useState("Crypto/Digital Assets");
  const [sortKey, setSortKey] = useState<SortKey>("valueUsd");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");

  const sortedAllocations = useMemo(
    () => sortAllocations(allocations, sortKey, sortDirection),
    [sortDirection, sortKey],
  );

  const selectedAllocation =
    allocations.find((allocation) => allocation.asset === selectedAsset) ??
    allocations[0];

  const selectedPnl = pnlByAsset.find((asset) => asset.asset === selectedAsset);
  const maxDailyMove = Math.max(
    ...pnlByAsset.map((asset) => Math.abs(asset.dailyChangeUsd)),
  );

  const filteredBreaches = useMemo(
    () =>
      severityFilter === "ALL"
        ? breaches
        : breaches.filter((breach) => breach.severity === severityFilter),
    [severityFilter],
  );

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "asset" ? "asc" : "desc");
  };

  return (
    <section className="min-h-screen bg-[#0B0E14] p-3 text-[#EEF3FF] sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
        <header className="grid gap-3 border border-[#283142] bg-[#111722] p-3 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#38445A] bg-[#161B26] px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#FFB020] tabular-nums">
                {portfolio.portfolioId}
              </span>
              <span className="border border-[#5A3041] bg-[#291721] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF7B8A]">
                {portfolio.complianceStatus}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#F6F8FC] sm:text-3xl">
              Financial Metrics Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#9AA7BA]">
              {portfolio.clientName} portfolio telemetry, allocation drift, P/L,
              and mandate breach surveillance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right lg:min-w-[360px]">
            <div className="border border-[#283142] bg-[#161B26] p-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                Updated
              </div>
              <div className="mt-1 font-mono text-sm tabular-nums text-[#EEF3FF]">
                {formatDateTime(portfolio.lastUpdated)}
              </div>
            </div>
            <div className="border border-[#283142] bg-[#161B26] p-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                Last Scan
              </div>
              <div className="mt-1 font-mono text-sm tabular-nums text-[#EEF3FF]">
                {formatDateTime(portfolio.compliance.lastScan)}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total AUM"
            value={portfolio.metrics.totalAum}
            detail="Validated portfolio value"
          />
          <MetricCard
            label="Unrealized P/L"
            value={portfolio.metrics.unrealizedPnl}
            detail="Open position mark"
            intent="positive"
          />
          <MetricCard
            label="Cash Reserve"
            value={portfolio.metrics.cashReserveRatio}
            detail="Liquidity floor watch"
            intent="negative"
          />
          <MetricCard
            label="Weighted Risk"
            value={portfolio.metrics.weightedRisk.toFixed(2)}
            detail="Value-weighted score"
            intent="warning"
          />
        </div>

        <nav
          className="flex flex-wrap gap-2 border border-[#283142] bg-[#111722] p-2"
          aria-label="Dashboard views"
        >
          {(Object.keys(viewLabels) as ViewKey[]).map((view) => (
            <button
              key={view}
              className={cx(
                "border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition",
                activeView === view
                  ? "border-[#FFB020] bg-[#2A2114] text-[#FFCC66]"
                  : "border-[#283142] bg-[#161B26] text-[#8E9AAF] hover:border-[#46566F] hover:text-[#EEF3FF]",
              )}
              type="button"
              onClick={() => setActiveView(view)}
            >
              {viewLabels[view]}
            </button>
          ))}
        </nav>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-h-[520px] border border-[#283142] bg-[#111722]">
            {activeView === "allocations" && (
              <div className="p-3">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                      Allocation Matrix
                    </h2>
                    <p className="mt-1 text-xs text-[#7F8CA3]">
                      Click rows to focus the asset detail rail. Headers sort the
                      dense metric table.
                    </p>
                  </div>
                  <div className="font-mono text-xs tabular-nums text-[#9AA7BA]">
                    Rows: {allocations.length} / AUM: {portfolio.metrics.totalAum}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
                    <thead>
                      <tr className="border-b border-[#283142]">
                        <th className="border-b border-[#283142] px-2 py-2">
                          <SortButton
                            label="Asset"
                            sortKey="asset"
                            activeSortKey={sortKey}
                            direction={sortDirection}
                            onSort={handleSort}
                          />
                        </th>
                        <th className="border-b border-[#283142] px-2 py-2">
                          <SortButton
                            label="Value"
                            sortKey="valueUsd"
                            activeSortKey={sortKey}
                            direction={sortDirection}
                            onSort={handleSort}
                            align="right"
                          />
                        </th>
                        <th className="border-b border-[#283142] px-2 py-2">
                          <SortButton
                            label="Weight"
                            sortKey="weight"
                            activeSortKey={sortKey}
                            direction={sortDirection}
                            onSort={handleSort}
                            align="right"
                          />
                        </th>
                        <th className="border-b border-[#283142] px-2 py-2">
                          <SortButton
                            label="Target"
                            sortKey="drift"
                            activeSortKey={sortKey}
                            direction={sortDirection}
                            onSort={handleSort}
                            align="right"
                          />
                        </th>
                        <th className="border-b border-[#283142] px-2 py-2">
                          <SortButton
                            label="Risk"
                            sortKey="riskScore"
                            activeSortKey={sortKey}
                            direction={sortDirection}
                            onSort={handleSort}
                            align="right"
                          />
                        </th>
                        <th className="border-b border-[#283142] px-2 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8CA3]">
                          Exposure Bar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAllocations.map((allocation) => {
                        const selected = allocation.asset === selectedAsset;

                        return (
                          <tr
                            key={allocation.asset}
                            className={cx(
                              "cursor-pointer transition hover:bg-[#1B2332]",
                              selected && "bg-[#20283A]",
                            )}
                            onClick={() => setSelectedAsset(allocation.asset)}
                          >
                            <td className="border-b border-[#202837] px-2 py-2">
                              <div className="text-sm font-semibold text-[#EEF3FF]">
                                {allocation.asset}
                              </div>
                              <div className="mt-0.5 text-[11px] text-[#718096]">
                                Drift {allocation.driftPct} vs model
                              </div>
                            </td>
                            <td className="border-b border-[#202837] px-2 py-2 text-right font-mono text-sm tabular-nums text-[#EEF3FF]">
                              {allocation.value}
                            </td>
                            <td className="border-b border-[#202837] px-2 py-2 text-right font-mono text-sm tabular-nums text-[#C8D2E3]">
                              {allocation.weightPct}
                            </td>
                            <td className="border-b border-[#202837] px-2 py-2 text-right font-mono text-sm tabular-nums">
                              <span className="text-[#C8D2E3]">
                                {allocation.targetPct}
                              </span>
                              <span
                                className={cx(
                                  "ml-3",
                                  toneClass(allocation.drift),
                                )}
                              >
                                {allocation.driftPct}
                              </span>
                            </td>
                            <td className="border-b border-[#202837] px-2 py-2 text-right font-mono text-sm tabular-nums text-[#FFCC66]">
                              {allocation.riskScore.toFixed(1)}
                            </td>
                            <td className="border-b border-[#202837] px-2 py-2">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-2 w-40 bg-[#252E40]">
                                  <div
                                    className="h-2 bg-[#6EA8FE]"
                                    style={{ width: `${allocation.weight}%` }}
                                  />
                                </div>
                                <span className="w-14 text-right font-mono text-xs tabular-nums text-[#9AA7BA]">
                                  {allocation.weightPct}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === "pnl" && (
              <div className="p-3">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                      P/L Attribution
                    </h2>
                    <p className="mt-1 text-xs text-[#7F8CA3]">
                      Select an asset to synchronize the attribution bars with the
                      detail rail.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["Daily", portfolio.pnl.dailyChange],
                      ["Daily %", portfolio.pnl.dailyChangePct],
                      ["MTD", portfolio.pnl.mtdPnl],
                      ["YTD", portfolio.pnl.ytdPnl],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border border-[#283142] bg-[#161B26] px-2 py-1.5 text-right"
                      >
                        <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                          {label}
                        </div>
                        <div
                          className={cx(
                            "mt-1 font-mono text-xs tabular-nums",
                            value.startsWith("-")
                              ? "text-[#FF5B6B]"
                              : "text-[#4FF5A7]",
                          )}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  {pnlByAsset.map((asset) => {
                    const selected = asset.asset === selectedAsset;
                    const width = Math.max(
                      6,
                      (Math.abs(asset.dailyChangeUsd) / maxDailyMove) * 100,
                    );

                    return (
                      <button
                        key={asset.asset}
                        className={cx(
                          "grid gap-3 border p-3 text-left transition md:grid-cols-[180px_1fr_150px]",
                          selected
                            ? "border-[#FFB020] bg-[#241F17]"
                            : "border-[#283142] bg-[#161B26] hover:border-[#46566F]",
                        )}
                        type="button"
                        onClick={() => setSelectedAsset(asset.asset)}
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#EEF3FF]">
                            {asset.asset}
                          </div>
                          <div className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[#7F8CA3] tabular-nums">
                            {asset.direction}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-14 text-right font-mono text-xs tabular-nums text-[#7F8CA3]">
                            LOSS
                          </span>
                          <div className="relative h-8 flex-1 bg-[#252E40]">
                            <div className="absolute left-1/2 top-0 h-full w-px bg-[#6A7488]" />
                            <div
                              className={cx(
                                "absolute top-1 h-6",
                                asset.dailyChangeUsd < 0
                                  ? "right-1/2 bg-[#FF5B6B]"
                                  : "left-1/2 bg-[#4FF5A7]",
                              )}
                              style={{ width: `${width / 2}%` }}
                            />
                          </div>
                          <span className="w-14 font-mono text-xs tabular-nums text-[#7F8CA3]">
                            GAIN
                          </span>
                        </div>
                        <div className="text-right font-mono text-sm tabular-nums">
                          <div className={toneClass(asset.dailyChangeUsd)}>
                            {asset.dailyChange}
                          </div>
                          <div className="mt-1 text-[#C8D2E3]">{asset.netPnl}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeView === "compliance" && (
              <div className="p-3">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                      Compliance Watchlist
                    </h2>
                    <p className="mt-1 text-xs text-[#7F8CA3]">
                      Filter by severity and select breached assets from the rail
                      for allocation context.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {severityFilters.map((severity) => (
                      <button
                        key={severity}
                        className={cx(
                          "border px-2 py-1 font-mono text-[11px] font-semibold tabular-nums transition",
                          severityFilter === severity
                            ? "border-[#FFB020] bg-[#2A2114] text-[#FFCC66]"
                            : "border-[#283142] bg-[#161B26] text-[#9AA7BA] hover:border-[#46566F]",
                        )}
                        type="button"
                        onClick={() => setSeverityFilter(severity)}
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  {filteredBreaches.map((breach) => (
                    <button
                      key={breach.id}
                      className="border border-[#283142] bg-[#161B26] p-3 text-left transition hover:border-[#46566F] hover:bg-[#1B2332]"
                      type="button"
                      onClick={() => setSelectedAsset(breach.asset)}
                    >
                      <div className="grid gap-3 md:grid-cols-[120px_1fr_220px]">
                        <div>
                          <div className="font-mono text-xs font-semibold text-[#EEF3FF] tabular-nums">
                            {breach.id}
                          </div>
                          <div
                            className={cx(
                              "mt-2 inline-flex border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                              breach.severity === "CRITICAL" &&
                                "border-[#7A2631] bg-[#2B151A] text-[#FF6B7A]",
                              breach.severity === "HIGH" &&
                                "border-[#6F4B1D] bg-[#2A2114] text-[#FFCC66]",
                              breach.severity === "MEDIUM" &&
                                "border-[#38445A] bg-[#1A2230] text-[#8FB6FF]",
                            )}
                          >
                            {breach.severity}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#EEF3FF]">
                            {breach.rule}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-[#9AA7BA]">
                            {breach.description}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-right font-mono text-xs tabular-nums">
                          <div className="border border-[#283142] bg-[#111722] p-2">
                            <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                              Limit
                            </div>
                            <div className="mt-1 text-[#C8D2E3]">
                              {breach.limit ?? "N/A"}
                            </div>
                          </div>
                          <div className="border border-[#283142] bg-[#111722] p-2">
                            <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                              Current
                            </div>
                            <div className="mt-1 text-[#FFCC66]">
                              {breach.current ?? "N/A"}
                            </div>
                          </div>
                          <div className="col-span-2 text-[#7F8CA3]">
                            {formatDateTime(breach.detectedAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="border border-[#283142] bg-[#111722] p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                Asset Focus
              </h2>
              <span className="border border-[#38445A] bg-[#161B26] px-2 py-1 font-mono text-[11px] text-[#9AA7BA] tabular-nums">
                LIVE MODEL
              </span>
            </div>

            <div className="mt-4 border border-[#283142] bg-[#161B26] p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-[#7F8CA3]">
                Selected Asset
              </div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#EEF3FF]">
                {selectedAllocation.asset}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="border border-[#283142] bg-[#111722] p-2">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                    Value
                  </div>
                  <div className="mt-1 font-mono text-sm tabular-nums text-[#EEF3FF]">
                    {selectedAllocation.value}
                  </div>
                </div>
                <div className="border border-[#283142] bg-[#111722] p-2">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                    Risk
                  </div>
                  <div className="mt-1 font-mono text-sm tabular-nums text-[#FFCC66]">
                    {selectedAllocation.riskScore.toFixed(1)}
                  </div>
                </div>
                <div className="border border-[#283142] bg-[#111722] p-2">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                    Weight
                  </div>
                  <div className="mt-1 font-mono text-sm tabular-nums text-[#C8D2E3]">
                    {selectedAllocation.weightPct}
                  </div>
                </div>
                <div className="border border-[#283142] bg-[#111722] p-2">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                    Drift
                  </div>
                  <div
                    className={cx(
                      "mt-1 font-mono text-sm tabular-nums",
                      toneClass(selectedAllocation.drift),
                    )}
                  >
                    {selectedAllocation.driftPct}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between font-mono text-[11px] tabular-nums text-[#9AA7BA]">
                  <span>0%</span>
                  <span>Target {selectedAllocation.targetPct}</span>
                  <span>60%</span>
                </div>
                <div className="relative h-3 bg-[#252E40]">
                  <div
                    className="absolute top-0 h-3 bg-[#6EA8FE]"
                    style={{ width: `${selectedAllocation.weight}%` }}
                  />
                  <div
                    className="absolute top-[-3px] h-5 w-px bg-[#FFB020]"
                    style={{ left: `${selectedAllocation.target}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 border border-[#283142] bg-[#161B26] p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-[#7F8CA3]">
                P/L Linkage
              </div>
              {selectedPnl ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="border border-[#283142] bg-[#111722] p-2">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                      Net P/L
                    </div>
                    <div className="mt-1 font-mono text-sm tabular-nums text-[#EEF3FF]">
                      {selectedPnl.netPnl}
                    </div>
                  </div>
                  <div className="border border-[#283142] bg-[#111722] p-2">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-[#7F8CA3]">
                      Daily
                    </div>
                    <div
                      className={cx(
                        "mt-1 font-mono text-sm tabular-nums",
                        toneClass(selectedPnl.dailyChangeUsd),
                      )}
                    >
                      {selectedPnl.dailyChange}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#9AA7BA]">
                  No asset-level P/L was reported for this allocation.
                </p>
              )}
            </div>

            <div className="mt-3 border border-[#4C2E34] bg-[#24181D] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF7B8A]">
                  Compliance Load
                </span>
                <span className="font-mono text-sm tabular-nums text-[#EEF3FF]">
                  {portfolio.compliance.openBreachCount} open /{" "}
                  {portfolio.compliance.warningCount} warning
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#B8C1D1]">
                {portfolio.compliance.status} requires mandate review before
                additional risk is added to the selected portfolio.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
