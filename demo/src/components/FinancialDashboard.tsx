"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Allocation = {
  asset: string;
  value: string;
  weight: number;
  weightLabel: string;
  riskScore: number;
  targetPct: string;
  driftPct: string;
  color: string;
};

type Breach = {
  id: string;
  rule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "OPEN" | "WARNING";
  asset: string;
  detectedAt: string;
  description: string;
  limit: string | null;
  current: string | null;
};

type Position = {
  symbol: string;
  instrument: string;
  exposure: string;
  quantity: string;
  marketValue: string;
  dayPnl: string;
  weight: string;
  risk: string;
  sort: {
    symbol: string;
    marketValue: number;
    dayPnl: number;
    weight: number;
    risk: number;
  };
};

type SortKey = keyof Position["sort"];
type PositionTab = "stocks" | "options";

const numericStyle: CSSProperties = {
  fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  fontVariantNumeric: "tabular-nums lining-nums",
};

const portfolio = {
  id: "PORT-9921-X",
  client: "Apex Global Asset Management",
  lastUpdated: "2026-06-23T15:30:00Z",
  complianceStatus: "ACTION_REQUIRED",
  metrics: {
    totalAum: "$125,000,000.00",
    unrealizedPnl: "$4,200,500.00",
    cashReserveRatio: "8.00%",
  },
  weightedRiskScore: 4.1,
  pnl: {
    netPnl: "+$5,180,500.00",
    realizedPnl: "+$980,000.00",
    unrealizedPnl: "+$4,200,500.00",
    dailyChange: "-$312,750.00",
    dailyChangePct: "-0.61%",
    mtdPnl: "+$2,870,300.00",
    ytdPnl: "+$11,450,900.00",
    byAsset: [
      {
        asset: "Equities",
        netPnl: "+$3,120,000.00",
        dailyChange: "-$210,500.00",
        direction: "up",
      },
      {
        asset: "Fixed Income",
        netPnl: "+$640,500.00",
        dailyChange: "+$18,750.00",
        direction: "up",
      },
      {
        asset: "Crypto/Digital Assets",
        netPnl: "+$1,980,000.00",
        dailyChange: "-$145,000.00",
        direction: "up",
      },
      {
        asset: "Real Estate",
        netPnl: "+$215,000.00",
        dailyChange: "+$9,500.00",
        direction: "up",
      },
      {
        asset: "Commodities",
        netPnl: "-$775,000.00",
        dailyChange: "+$14,500.00",
        direction: "down",
      },
    ],
  },
};

const allocations: Allocation[] = [
  {
    asset: "Equities",
    value: "$60,000,000.00",
    weight: 48,
    weightLabel: "48.0%",
    riskScore: 4,
    targetPct: "50.0%",
    driftPct: "-2.00%",
    color: "#4C82FB",
  },
  {
    asset: "Fixed Income",
    value: "$35,000,000.00",
    weight: 28,
    weightLabel: "28.0%",
    riskScore: 2,
    targetPct: "28.0%",
    driftPct: "+0.00%",
    color: "#16C784",
  },
  {
    asset: "Crypto/Digital Assets",
    value: "$15,000,000.00",
    weight: 12,
    weightLabel: "12.0%",
    riskScore: 9,
    targetPct: "10.0%",
    driftPct: "+2.00%",
    color: "#F0A92E",
  },
  {
    asset: "Real Estate",
    value: "$8,000,000.00",
    weight: 6.4,
    weightLabel: "6.4%",
    riskScore: 5,
    targetPct: "7.0%",
    driftPct: "-0.60%",
    color: "#9B7CFF",
  },
  {
    asset: "Commodities",
    value: "$4,000,000.00",
    weight: 3.2,
    weightLabel: "3.2%",
    riskScore: 6,
    targetPct: "3.0%",
    driftPct: "+0.20%",
    color: "#EA3943",
  },
  {
    asset: "Cash",
    value: "$3,000,000.00",
    weight: 2.4,
    weightLabel: "2.4%",
    riskScore: 1,
    targetPct: "2.0%",
    driftPct: "+0.40%",
    color: "#8A93A6",
  },
];

const breaches: Breach[] = [
  {
    id: "BRC-1042",
    rule: "Single-Asset Concentration Limit",
    severity: "CRITICAL",
    status: "OPEN",
    asset: "Crypto/Digital Assets",
    detectedAt: "2026-06-23T14:55:00Z",
    description:
      "Crypto/Digital Assets allocation of 12.0% exceeds the 10.0% mandate ceiling.",
    limit: "10.00%",
    current: "12.00%",
  },
  {
    id: "BRC-1043",
    rule: "Minimum Cash Reserve",
    severity: "HIGH",
    status: "OPEN",
    asset: "Cash",
    detectedAt: "2026-06-23T15:10:00Z",
    description:
      "Cash reserve ratio of 8.0% is below the required 10.0% liquidity floor.",
    limit: "10.00%",
    current: "8.00%",
  },
  {
    id: "BRC-1044",
    rule: "Portfolio Risk Score Ceiling",
    severity: "MEDIUM",
    status: "WARNING",
    asset: "Portfolio",
    detectedAt: "2026-06-23T15:12:00Z",
    description:
      "Value-weighted risk score is trending toward the 4.0 advisory threshold.",
    limit: null,
    current: null,
  },
];

const stockPositions: Position[] = [
  {
    symbol: "AAPL",
    instrument: "Apple Inc.",
    exposure: "Mega-cap technology",
    quantity: "120,000",
    marketValue: "$23,400,000.00",
    dayPnl: "-$84,000.00",
    weight: "18.72%",
    risk: "4.2",
    sort: {
      symbol: "AAPL",
      marketValue: 23400000,
      dayPnl: -84000,
      weight: 18.72,
      risk: 4.2,
    },
  },
  {
    symbol: "MSFT",
    instrument: "Microsoft Corp.",
    exposure: "Cloud software",
    quantity: "60,000",
    marketValue: "$9,000,000.00",
    dayPnl: "+$36,000.00",
    weight: "7.20%",
    risk: "3.8",
    sort: {
      symbol: "MSFT",
      marketValue: 9000000,
      dayPnl: 36000,
      weight: 7.2,
      risk: 3.8,
    },
  },
  {
    symbol: "NVDA",
    instrument: "NVIDIA Corp.",
    exposure: "AI semiconductors",
    quantity: "45,000",
    marketValue: "$18,225,000.00",
    dayPnl: "-$126,000.00",
    weight: "14.58%",
    risk: "6.9",
    sort: {
      symbol: "NVDA",
      marketValue: 18225000,
      dayPnl: -126000,
      weight: 14.58,
      risk: 6.9,
    },
  },
  {
    symbol: "JPM",
    instrument: "JPMorgan Chase & Co.",
    exposure: "Money-center banks",
    quantity: "50,000",
    marketValue: "$10,875,000.00",
    dayPnl: "-$12,500.00",
    weight: "8.70%",
    risk: "3.5",
    sort: {
      symbol: "JPM",
      marketValue: 10875000,
      dayPnl: -12500,
      weight: 8.7,
      risk: 3.5,
    },
  },
  {
    symbol: "XOM",
    instrument: "Exxon Mobil Corp.",
    exposure: "Integrated energy",
    quantity: "35,000",
    marketValue: "$4,375,000.00",
    dayPnl: "+$14,500.00",
    weight: "3.50%",
    risk: "5.1",
    sort: {
      symbol: "XOM",
      marketValue: 4375000,
      dayPnl: 14500,
      weight: 3.5,
      risk: 5.1,
    },
  },
];

const optionPositions: Position[] = [
  {
    symbol: "SPX 4400P",
    instrument: "S&P 500 Index Put",
    exposure: "Sep 2026 downside hedge",
    quantity: "1,250",
    marketValue: "$4,125,000.00",
    dayPnl: "+$72,500.00",
    weight: "3.30%",
    risk: "2.4",
    sort: {
      symbol: "SPX 4400P",
      marketValue: 4125000,
      dayPnl: 72500,
      weight: 3.3,
      risk: 2.4,
    },
  },
  {
    symbol: "NVDA 150C",
    instrument: "NVIDIA Covered Call",
    exposure: "Jul 2026 overwrite",
    quantity: "-450",
    marketValue: "-$1,350,000.00",
    dayPnl: "+$18,750.00",
    weight: "-1.08%",
    risk: "6.1",
    sort: {
      symbol: "NVDA 150C",
      marketValue: -1350000,
      dayPnl: 18750,
      weight: -1.08,
      risk: 6.1,
    },
  },
  {
    symbol: "AAPL 180P",
    instrument: "Apple Protective Put",
    exposure: "Aug 2026 collar leg",
    quantity: "800",
    marketValue: "$2,080,000.00",
    dayPnl: "+$9,600.00",
    weight: "1.66%",
    risk: "3.1",
    sort: {
      symbol: "AAPL 180P",
      marketValue: 2080000,
      dayPnl: 9600,
      weight: 1.66,
      risk: 3.1,
    },
  },
  {
    symbol: "BTC 75C",
    instrument: "Bitcoin Call Spread",
    exposure: "Dec 2026 digital assets",
    quantity: "300",
    marketValue: "$6,450,000.00",
    dayPnl: "-$138,000.00",
    weight: "5.16%",
    risk: "9.3",
    sort: {
      symbol: "BTC 75C",
      marketValue: 6450000,
      dayPnl: -138000,
      weight: 5.16,
      risk: 9.3,
    },
  },
  {
    symbol: "GLD 220C",
    instrument: "Gold ETF Call",
    exposure: "Nov 2026 commodity beta",
    quantity: "700",
    marketValue: "$1,820,000.00",
    dayPnl: "+$14,500.00",
    weight: "1.46%",
    risk: "5.8",
    sort: {
      symbol: "GLD 220C",
      marketValue: 1820000,
      dayPnl: 14500,
      weight: 1.46,
      risk: 5.8,
    },
  },
];

const severityStyles: Record<Breach["severity"], string> = {
  CRITICAL: "border-[#EA3943]/70 bg-[#EA3943]/10 text-[#F7A1A6]",
  HIGH: "border-[#F0A92E]/70 bg-[#F0A92E]/10 text-[#F7CB7A]",
  MEDIUM: "border-[#4C82FB]/70 bg-[#4C82FB]/10 text-[#A8C0FF]",
};

const panelClass =
  "rounded-md border border-[#222838] bg-[#161B26] shadow-[0_0_0_1px_rgba(76,130,251,0.04)]";

function signedTone(value: string) {
  if (value.trim().startsWith("-")) {
    return "text-[#EA3943]";
  }

  if (value.trim().startsWith("+")) {
    return "text-[#16C784]";
  }

  return "text-[#E6E9EF]";
}

function sortPositions(
  positions: Position[],
  sortKey: SortKey,
  direction: "asc" | "desc",
) {
  return [...positions].sort((a, b) => {
    const left = a.sort[sortKey];
    const right = b.sort[sortKey];
    const order =
      typeof left === "string"
        ? left.localeCompare(String(right))
        : left - Number(right);

    return direction === "asc" ? order : -order;
  });
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default function FinancialDashboard() {
  const [selectedAllocationIndex, setSelectedAllocationIndex] = useState(2);
  const [selectedBreachId, setSelectedBreachId] = useState(breaches[0].id);
  const [positionTab, setPositionTab] = useState<PositionTab>("stocks");
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const selectedAllocation = allocations[selectedAllocationIndex];
  const selectedBreach =
    breaches.find((breach) => breach.id === selectedBreachId) ?? breaches[0];
  const activePositions =
    positionTab === "stocks" ? stockPositions : optionPositions;

  const sortedPositions = useMemo(
    () => sortPositions(activePositions, sortKey, sortDirection),
    [activePositions, sortDirection, sortKey],
  );

  function handleSort(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "symbol" ? "asc" : "desc");
  }

  return (
    <main className="min-h-screen bg-[#0B0E14] px-4 py-4 text-[#E6E9EF] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#222838] pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4C82FB]">
              Apex Asset Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#E6E9EF]">
              {portfolio.client}
            </h1>
            <p className="mt-1 text-xs text-[#8A93A6]">
              Portfolio {portfolio.id} / Updated{" "}
              <span style={numericStyle}>
                {formatTimestamp(portfolio.lastUpdated)}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-right md:grid-cols-4">
            <MetricTile label="Total AUM" value={portfolio.metrics.totalAum} />
            <MetricTile
              label="Net P&L"
              value={portfolio.pnl.netPnl}
              tone={signedTone(portfolio.pnl.netPnl)}
            />
            <MetricTile
              label="Daily Move"
              value={`${portfolio.pnl.dailyChange} (${portfolio.pnl.dailyChangePct})`}
              tone={signedTone(portfolio.pnl.dailyChange)}
            />
            <MetricTile
              label="Compliance"
              value={portfolio.complianceStatus.replace("_", " ")}
              tone="text-[#F0A92E]"
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <div className={`${panelClass} p-3`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E6E9EF]">
                  Allocation Chart
                </h2>
                <p className="mt-1 text-xs text-[#8A93A6]">
                  Units: percent of total AUM. Select a slice or row to inspect
                  risk, target, and drift.
                </p>
              </div>
              <div className="rounded border border-[#222838] bg-[#0B0E14] px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
                  Selected Asset
                </p>
                <p className="mt-1 text-sm font-semibold text-[#E6E9EF]">
                  {selectedAllocation.asset}
                </p>
                <p
                  className={`mt-1 text-xs ${signedTone(
                    selectedAllocation.driftPct,
                  )}`}
                  style={numericStyle}
                >
                  Drift {selectedAllocation.driftPct}
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="h-[360px] min-h-[320px] rounded border border-[#222838] bg-[#0F131B] p-2">
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
                  <span>Allocation Weight (%)</span>
                  <span>Legend: Asset Class</span>
                </div>
                <ResponsiveContainer width="100%" height="92%">
                  <PieChart>
                    <Pie
                      data={allocations}
                      dataKey="weight"
                      nameKey="asset"
                      innerRadius="46%"
                      outerRadius="72%"
                      paddingAngle={2}
                      labelLine
                      label={(props) => {
                        const allocation = props.payload as Allocation;
                        return `${allocation.asset}: ${allocation.weightLabel}`;
                      }}
                      onClick={(_, index) => setSelectedAllocationIndex(index)}
                    >
                      {allocations.map((allocation, index) => (
                        <Cell
                          key={allocation.asset}
                          cursor="pointer"
                          fill={allocation.color}
                          stroke={
                            index === selectedAllocationIndex
                              ? "#E6E9EF"
                              : "#0B0E14"
                          }
                          strokeWidth={index === selectedAllocationIndex ? 2 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        const allocation = payload?.[0]?.payload as
                          | Allocation
                          | undefined;

                        if (!active || !allocation) {
                          return null;
                        }

                        return (
                          <div className="rounded border border-[#222838] bg-[#161B26] p-2 text-xs shadow-xl">
                            <p className="font-semibold text-[#E6E9EF]">
                              {allocation.asset}
                            </p>
                            <p className="mt-1 text-[#8A93A6]">
                              Value{" "}
                              <span
                                className="text-[#E6E9EF]"
                                style={numericStyle}
                              >
                                {allocation.value}
                              </span>
                            </p>
                            <p className="text-[#8A93A6]">
                              Weight{" "}
                              <span
                                className="text-[#E6E9EF]"
                                style={numericStyle}
                              >
                                {allocation.weightLabel}
                              </span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{
                        color: "#8A93A6",
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-hidden rounded border border-[#222838]">
                <table className="w-full border-collapse text-xs">
                  <caption className="bg-[#0F131B] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A93A6]">
                    Allocation Detail / Value, Weight, Target, Drift, Risk Score
                  </caption>
                  <thead className="bg-[#0B0E14] text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Asset</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Value
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Weight
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Target
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Drift
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((allocation, index) => (
                      <tr
                        key={allocation.asset}
                        className={`cursor-pointer border-t border-[#222838] transition ${
                          index === selectedAllocationIndex
                            ? "bg-[#4C82FB]/15"
                            : "hover:bg-[#222838]/45"
                        }`}
                        onClick={() => setSelectedAllocationIndex(index)}
                      >
                        <td className="px-3 py-2 text-left">
                          <span
                            className="mr-2 inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: allocation.color }}
                          />
                          {allocation.asset}
                        </td>
                        <td className="px-3 py-2 text-right" style={numericStyle}>
                          {allocation.value}
                        </td>
                        <td className="px-3 py-2 text-right" style={numericStyle}>
                          {allocation.weightLabel}
                        </td>
                        <td className="px-3 py-2 text-right" style={numericStyle}>
                          {allocation.targetPct}
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${signedTone(
                            allocation.driftPct,
                          )}`}
                          style={numericStyle}
                        >
                          {allocation.driftPct}
                        </td>
                        <td className="px-3 py-2 text-right" style={numericStyle}>
                          {allocation.riskScore.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <RiskPanel
            selectedBreach={selectedBreach}
            selectedBreachId={selectedBreachId}
            onSelectBreach={setSelectedBreachId}
          />
        </section>

        <section className="grid grid-cols-1 gap-3 2xl:grid-cols-[0.78fr_1.22fr]">
          <div className={`${panelClass} p-3`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  P&L Ladder
                </h2>
                <p className="mt-1 text-xs text-[#8A93A6]">
                  Parser-formatted signed USD values by asset class.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
                  YTD P&L
                </p>
                <p
                  className={`text-lg font-semibold ${signedTone(
                    portfolio.pnl.ytdPnl,
                  )}`}
                  style={numericStyle}
                >
                  {portfolio.pnl.ytdPnl}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <MetricTile
                label="Realized"
                value={portfolio.pnl.realizedPnl}
                tone={signedTone(portfolio.pnl.realizedPnl)}
              />
              <MetricTile
                label="Unrealized"
                value={portfolio.pnl.unrealizedPnl}
                tone={signedTone(portfolio.pnl.unrealizedPnl)}
              />
              <MetricTile
                label="MTD"
                value={portfolio.pnl.mtdPnl}
                tone={signedTone(portfolio.pnl.mtdPnl)}
              />
            </div>

            <div className="mt-3 divide-y divide-[#222838] overflow-hidden rounded border border-[#222838]">
              {portfolio.pnl.byAsset.map((asset) => (
                <div
                  key={asset.asset}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-[#0F131B] px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium text-[#E6E9EF]">{asset.asset}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
                      Net / Daily
                    </p>
                  </div>
                  <p
                    className={signedTone(asset.netPnl)}
                    style={numericStyle}
                  >
                    {asset.direction === "up" ? "UP " : "DOWN "}
                    {asset.netPnl}
                  </p>
                  <p
                    className={signedTone(asset.dailyChange)}
                    style={numericStyle}
                  >
                    {asset.dailyChange}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${panelClass} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222838] p-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Stock / Options Positions
                </h2>
                <p className="mt-1 text-xs text-[#8A93A6]">
                  Click column headers to sort. Numeric fields are right-aligned
                  with tabular figures.
                </p>
              </div>
              <div className="flex rounded border border-[#222838] bg-[#0B0E14] p-1 text-xs">
                {(["stocks", "options"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`px-3 py-1 uppercase tracking-[0.14em] transition ${
                      positionTab === tab
                        ? "bg-[#4C82FB] text-[#E6E9EF]"
                        : "text-[#8A93A6] hover:text-[#E6E9EF]"
                    }`}
                    onClick={() => setPositionTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-xs">
                <caption className="sr-only">
                  Sortable {positionTab} position table with market value, daily
                  P&L, portfolio weight, and risk score
                </caption>
                <thead className="bg-[#0B0E14] text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
                  <tr>
                    <SortableHeader
                      label="Symbol"
                      sortKey="symbol"
                      activeSortKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                      align="left"
                    />
                    <th className="px-3 py-2 text-left font-medium">
                      Instrument
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Exposure
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Quantity
                    </th>
                    <SortableHeader
                      label="Market Value"
                      sortKey="marketValue"
                      activeSortKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Day P&L"
                      sortKey="dayPnl"
                      activeSortKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Weight"
                      sortKey="weight"
                      activeSortKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Risk"
                      sortKey="risk"
                      activeSortKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedPositions.map((position) => (
                    <tr
                      key={position.symbol}
                      className="border-t border-[#222838] bg-[#161B26] hover:bg-[#222838]/45"
                    >
                      <td
                        className="px-3 py-2 font-semibold text-[#E6E9EF]"
                        style={numericStyle}
                      >
                        {position.symbol}
                      </td>
                      <td className="px-3 py-2 text-[#D3D7DF]">
                        {position.instrument}
                      </td>
                      <td className="px-3 py-2 text-[#8A93A6]">
                        {position.exposure}
                      </td>
                      <td className="px-3 py-2 text-right" style={numericStyle}>
                        {position.quantity}
                      </td>
                      <td className="px-3 py-2 text-right" style={numericStyle}>
                        {position.marketValue}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${signedTone(
                          position.dayPnl,
                        )}`}
                        style={numericStyle}
                      >
                        {position.dayPnl}
                      </td>
                      <td className="px-3 py-2 text-right" style={numericStyle}>
                        {position.weight}
                      </td>
                      <td className="px-3 py-2 text-right" style={numericStyle}>
                        {position.risk}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricTile({
  label,
  value,
  tone = "text-[#E6E9EF]",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-[148px] rounded border border-[#222838] bg-[#161B26] px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A93A6]">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${tone}`}
        style={numericStyle}
      >
        {value}
      </p>
    </div>
  );
}

function RiskPanel({
  selectedBreach,
  selectedBreachId,
  onSelectBreach,
}: {
  selectedBreach: Breach;
  selectedBreachId: string;
  onSelectBreach: (id: string) => void;
}) {
  return (
    <aside className={`${panelClass} p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            Risk Panel
          </h2>
          <p className="mt-1 text-xs text-[#8A93A6]">
            Weighted risk and live compliance breaches from the portfolio parse.
          </p>
        </div>
        <span className="rounded border border-[#F0A92E]/70 bg-[#F0A92E]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F7CB7A]">
          Action Required
        </span>
      </div>

      <div className="mt-3 rounded border border-[#222838] bg-[#0F131B] p-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
              Value-Weighted Risk Score
            </p>
            <p className="mt-1 text-3xl font-semibold text-[#F0A92E]" style={numericStyle}>
              {portfolio.weightedRiskScore.toFixed(2)}
            </p>
          </div>
          <div className="text-right text-xs text-[#8A93A6]">
            <p>Advisory ceiling</p>
            <p className="text-[#E6E9EF]" style={numericStyle}>
              4.00
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#222838]">
          <div
            className="h-full rounded-full bg-[#F0A92E]"
            style={{ width: `${Math.min(portfolio.weightedRiskScore * 10, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
          <span>Low 0</span>
          <span>Elevated 4</span>
          <span>High 10</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricTile label="Open Breaches" value="2" tone="text-[#EA3943]" />
        <MetricTile label="Warnings" value="1" tone="text-[#F0A92E]" />
      </div>

      <div className="mt-3 grid gap-2">
        {breaches.map((breach) => (
          <button
            key={breach.id}
            type="button"
            className={`rounded border p-2 text-left transition ${
              breach.id === selectedBreachId
                ? severityStyles[breach.severity]
                : "border-[#222838] bg-[#0F131B] text-[#E6E9EF] hover:bg-[#222838]/45"
            }`}
            onClick={() => onSelectBreach(breach.id)}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                {breach.id} / {breach.severity}
              </span>
              <span className="text-[10px]" style={numericStyle}>
                {formatTimestamp(breach.detectedAt)}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium">{breach.rule}</p>
          </button>
        ))}
      </div>

      <div className="mt-3 rounded border border-[#222838] bg-[#0B0E14] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8A93A6]">
              Selected Breach
            </p>
            <p className="mt-1 text-sm font-semibold text-[#E6E9EF]">
              {selectedBreach.rule}
            </p>
          </div>
          <span
            className={`rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              severityStyles[selectedBreach.severity]
            }`}
          >
            {selectedBreach.status}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#C6CBD5]">
          {selectedBreach.description}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
              Asset
            </p>
            <p className="mt-1 text-[#E6E9EF]">{selectedBreach.asset}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
              Limit
            </p>
            <p className="mt-1 text-[#E6E9EF]" style={numericStyle}>
              {selectedBreach.limit ?? "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8A93A6]">
              Current
            </p>
            <p className="mt-1 text-[#E6E9EF]" style={numericStyle}>
              {selectedBreach.current ?? "N/A"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  direction,
  onSort,
  align = "right",
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  direction: "asc" | "desc";
  onSort: (sortKey: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = activeSortKey === sortKey;

  return (
    <th
      className={`px-3 py-2 font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${
          align === "right" ? "justify-end" : "justify-start"
        } ${isActive ? "text-[#E6E9EF]" : "text-[#8A93A6]"}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        <span aria-hidden="true">{isActive ? (direction === "asc" ? "UP" : "DOWN") : "SORT"}</span>
      </button>
    </th>
  );
}
