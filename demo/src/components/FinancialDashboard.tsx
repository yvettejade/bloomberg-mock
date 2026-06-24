"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type Direction = "asc" | "desc";

type Allocation = {
  asset: string;
  shortLabel: string;
  value: number;
  valueLabel: string;
  riskScore: number;
  weight: number;
  weightLabel: string;
  target: number;
  targetLabel: string;
  drift: number;
  driftLabel: string;
  color: string;
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

type StockPosition = {
  symbol: string;
  name: string;
  sector: string;
  shares: number;
  marketValue: number;
  marketValueLabel: string;
  weight: number;
  weightLabel: string;
  dayPnl: number;
  dayPnlLabel: string;
  beta: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
};

type OptionPosition = {
  contract: string;
  underlying: string;
  side: "CALL" | "PUT";
  expiry: string;
  strike: number;
  delta: number;
  notional: number;
  notionalLabel: string;
  premium: number;
  premiumLabel: string;
  dayPnl: number;
  dayPnlLabel: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
};

const allocations: Allocation[] = [
  {
    asset: "Equities",
    shortLabel: "EQ",
    value: 60000000,
    valueLabel: "$60,000,000.00",
    riskScore: 4,
    weight: 48,
    weightLabel: "48.00%",
    target: 50,
    targetLabel: "50.00%",
    drift: -2,
    driftLabel: "-2.00%",
    color: "#69D2FF",
  },
  {
    asset: "Fixed Income",
    shortLabel: "FI",
    value: 35000000,
    valueLabel: "$35,000,000.00",
    riskScore: 2,
    weight: 28,
    weightLabel: "28.00%",
    target: 28,
    targetLabel: "28.00%",
    drift: 0,
    driftLabel: "+0.00%",
    color: "#8EE6A8",
  },
  {
    asset: "Crypto/Digital Assets",
    shortLabel: "CR",
    value: 15000000,
    valueLabel: "$15,000,000.00",
    riskScore: 9,
    weight: 12,
    weightLabel: "12.00%",
    target: 10,
    targetLabel: "10.00%",
    drift: 2,
    driftLabel: "+2.00%",
    color: "#FF8A14",
  },
  {
    asset: "Real Estate",
    shortLabel: "RE",
    value: 8000000,
    valueLabel: "$8,000,000.00",
    riskScore: 5,
    weight: 6.4,
    weightLabel: "6.40%",
    target: 7,
    targetLabel: "7.00%",
    drift: -0.6,
    driftLabel: "-0.60%",
    color: "#C9A8FF",
  },
  {
    asset: "Commodities",
    shortLabel: "CM",
    value: 4000000,
    valueLabel: "$4,000,000.00",
    riskScore: 6,
    weight: 3.2,
    weightLabel: "3.20%",
    target: 3,
    targetLabel: "3.00%",
    drift: 0.2,
    driftLabel: "+0.20%",
    color: "#F7D774",
  },
  {
    asset: "Cash",
    shortLabel: "CA",
    value: 3000000,
    valueLabel: "$3,000,000.00",
    riskScore: 1,
    weight: 2.4,
    weightLabel: "2.40%",
    target: 2,
    targetLabel: "2.00%",
    drift: 0.4,
    driftLabel: "+0.40%",
    color: "#9AA6B2",
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

const pnlByAsset = [
  {
    asset: "Equities",
    netPnl: "+$3,120,000.00",
    dailyChange: "-$210,500.00",
    direction: "down",
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
    direction: "down",
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
    direction: "up",
  },
];

const stockPositions: StockPosition[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    sector: "Semiconductors",
    shares: 8450,
    marketValue: 10780750,
    marketValueLabel: "$10,780,750.00",
    weight: 8.62,
    weightLabel: "8.62%",
    dayPnl: -64250,
    dayPnlLabel: "-$64,250.00",
    beta: 1.72,
    risk: "HIGH",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    sector: "Software",
    shares: 14200,
    marketValue: 7209400,
    marketValueLabel: "$7,209,400.00",
    weight: 5.77,
    weightLabel: "5.77%",
    dayPnl: 41800,
    dayPnlLabel: "+$41,800.00",
    beta: 0.91,
    risk: "MEDIUM",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Financials",
    shares: 26500,
    marketValue: 6171850,
    marketValueLabel: "$6,171,850.00",
    weight: 4.94,
    weightLabel: "4.94%",
    dayPnl: -18850,
    dayPnlLabel: "-$18,850.00",
    beta: 1.08,
    risk: "MEDIUM",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corp.",
    sector: "Energy",
    shares: 39200,
    marketValue: 4460960,
    marketValueLabel: "$4,460,960.00",
    weight: 3.57,
    weightLabel: "3.57%",
    dayPnl: 32750,
    dayPnlLabel: "+$32,750.00",
    beta: 0.78,
    risk: "LOW",
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    sector: "Payments",
    shares: 12100,
    marketValue: 4219270,
    marketValueLabel: "$4,219,270.00",
    weight: 3.38,
    weightLabel: "3.38%",
    dayPnl: -8700,
    dayPnlLabel: "-$8,700.00",
    beta: 0.84,
    risk: "LOW",
  },
];

const optionPositions: OptionPosition[] = [
  {
    contract: "SPY 2026-09-18 620C",
    underlying: "SPY",
    side: "CALL",
    expiry: "2026-09-18",
    strike: 620,
    delta: 0.41,
    notional: 6425000,
    notionalLabel: "$6,425,000.00",
    premium: 874500,
    premiumLabel: "$874,500.00",
    dayPnl: -52200,
    dayPnlLabel: "-$52,200.00",
    risk: "HIGH",
  },
  {
    contract: "QQQ 2026-08-21 555P",
    underlying: "QQQ",
    side: "PUT",
    expiry: "2026-08-21",
    strike: 555,
    delta: -0.32,
    notional: 3380000,
    notionalLabel: "$3,380,000.00",
    premium: 615000,
    premiumLabel: "$615,000.00",
    dayPnl: 28750,
    dayPnlLabel: "+$28,750.00",
    risk: "MEDIUM",
  },
  {
    contract: "NVDA 2026-07-17 155C",
    underlying: "NVDA",
    side: "CALL",
    expiry: "2026-07-17",
    strike: 155,
    delta: 0.57,
    notional: 2914000,
    notionalLabel: "$2,914,000.00",
    premium: 532800,
    premiumLabel: "$532,800.00",
    dayPnl: -41800,
    dayPnlLabel: "-$41,800.00",
    risk: "HIGH",
  },
  {
    contract: "TLT 2026-10-16 92C",
    underlying: "TLT",
    side: "CALL",
    expiry: "2026-10-16",
    strike: 92,
    delta: 0.26,
    notional: 1840000,
    notionalLabel: "$1,840,000.00",
    premium: 274600,
    premiumLabel: "$274,600.00",
    dayPnl: 12300,
    dayPnlLabel: "+$12,300.00",
    risk: "LOW",
  },
];

function sortRows<T extends Record<string, string | number>>(
  rows: T[],
  key: keyof T,
  direction: Direction,
) {
  return [...rows].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    const result =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right));

    return direction === "asc" ? result : -result;
  });
}

function directionFor(value: number) {
  return value < 0 ? "text-[#FF5D5D]" : "text-[#45E08B]";
}

function toggleDirection(current: Direction) {
  return current === "asc" ? "desc" : "asc";
}

function MetricTile({
  label,
  value,
  tone = "neutral",
  subvalue,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  subvalue?: string;
}) {
  const toneClass =
    tone === "positive"
      ? "text-[#45E08B]"
      : tone === "negative"
        ? "text-[#FF5D5D]"
        : tone === "warning"
          ? "text-[#FFB84D]"
          : "text-[#E8EDF2]";

  return (
    <div className="rounded-xl border border-[#252C3A] bg-[#161B26] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8A9A]">
          {label}
        </span>
        {subvalue ? (
          <span className="font-mono text-[10px] tabular-nums text-[#7F8A9A]">
            {subvalue}
          </span>
        ) : null}
      </div>
      <div
        className={`mt-2 whitespace-nowrap font-mono text-xl font-semibold leading-none tabular-nums ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#252C3A] bg-[#161B26] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7F8A9A]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-sm font-semibold tracking-wide text-[#F4F7FA]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function AllocationChart({
  selectedAsset,
  setSelectedAsset,
}: {
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
}) {
  const radius = 88;
  const stroke = 28;
  const circumference = 2 * Math.PI * radius;
  let runningOffset = 0;
  let runningAngle = 0;
  const selected = allocations.find((item) => item.asset === selectedAsset);

  return (
    <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
      <div className="relative mx-auto h-[260px] w-[270px]">
        <svg
          aria-label="Asset allocation chart with labeled segments"
          className="h-full w-full overflow-visible"
          role="img"
          viewBox="0 0 260 260"
        >
          <circle
            cx="130"
            cy="130"
            fill="none"
            r={radius}
            stroke="#252C3A"
            strokeWidth={stroke}
          />
          {allocations.map((allocation) => {
            const dash = (allocation.weight / 100) * circumference;
            const offset = runningOffset;
            const startAngle = runningAngle;
            const midAngle = startAngle + allocation.weight * 1.8;
            const labelX =
              130 + Math.cos(((midAngle - 90) * Math.PI) / 180) * 124;
            const labelY =
              130 + Math.sin(((midAngle - 90) * Math.PI) / 180) * 124;
            runningOffset += dash;
            runningAngle += allocation.weight * 3.6;

            return (
              <g key={allocation.asset}>
                <circle
                  className="cursor-pointer transition-opacity duration-150"
                  cx="130"
                  cy="130"
                  fill="none"
                  onClick={() => setSelectedAsset(allocation.asset)}
                  onMouseEnter={() => setSelectedAsset(allocation.asset)}
                  r={radius}
                  stroke={allocation.color}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  strokeWidth={selectedAsset === allocation.asset ? 34 : stroke}
                  style={{
                    opacity: selectedAsset === allocation.asset ? 1 : 0.7,
                    transform: "rotate(-90deg)",
                    transformOrigin: "130px 130px",
                  }}
                />
                <text
                  fill="#E8EDF2"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor={labelX >= 130 ? "start" : "end"}
                  x={labelX}
                  y={labelY}
                >
                  {allocation.shortLabel} {allocation.weightLabel}
                </text>
              </g>
            );
          })}
          <text
            fill="#7F8A9A"
            fontSize="10"
            fontWeight="700"
            letterSpacing="0.16em"
            textAnchor="middle"
            x="130"
            y="120"
          >
            SELECTED
          </text>
          <text
            fill="#F4F7FA"
            fontSize="15"
            fontWeight="700"
            textAnchor="middle"
            x="130"
            y="140"
          >
            {selected?.shortLabel}
          </text>
          <text
            fill="#AEB8C6"
            fontSize="11"
            textAnchor="middle"
            x="130"
            y="158"
          >
            Risk {selected?.riskScore}/10
          </text>
        </svg>
      </div>

      <div className="grid content-start gap-2">
        {allocations.map((allocation) => {
          const active = selectedAsset === allocation.asset;

          return (
            <button
              className={`grid grid-cols-[minmax(0,1fr)_92px_74px_70px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                active
                  ? "border-[#FF8A14]/70 bg-[#202633]"
                  : "border-[#252C3A] bg-[#111722] hover:border-[#3A4354]"
              }`}
              key={allocation.asset}
              onClick={() => setSelectedAsset(allocation.asset)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: allocation.color }}
                />
                <span className="truncate text-xs font-medium text-[#E8EDF2]">
                  {allocation.asset}
                </span>
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-[#E8EDF2]">
                {allocation.valueLabel}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-[#AEB8C6]">
                {allocation.weightLabel}
              </span>
              <span
                className={`text-right font-mono text-xs tabular-nums ${
                  allocation.drift > 0
                    ? "text-[#FFB84D]"
                    : allocation.drift < 0
                      ? "text-[#69D2FF]"
                      : "text-[#AEB8C6]"
                }`}
              >
                {allocation.driftLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RiskPanel({
  selectedBreachId,
  setSelectedBreachId,
}: {
  selectedBreachId: string;
  setSelectedBreachId: (id: string) => void;
}) {
  const selected = breaches.find((breach) => breach.id === selectedBreachId);
  const severityClass =
    selected?.severity === "CRITICAL"
      ? "bg-[#FF5D5D]/15 text-[#FF8B8B] ring-[#FF5D5D]/30"
      : selected?.severity === "HIGH"
        ? "bg-[#FFB84D]/15 text-[#FFD18A] ring-[#FFB84D]/30"
        : "bg-[#69D2FF]/15 text-[#9FDEFF] ring-[#69D2FF]/30";

  return (
    <Panel
      action={
        <span className="rounded-full bg-[#FF5D5D]/15 px-2.5 py-1 font-mono text-[10px] font-semibold tabular-nums text-[#FF8B8B]">
          ACTION_REQUIRED
        </span>
      }
      className="lg:col-span-5"
      eyebrow="risk panel"
      title="Compliance and Risk Control"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <div className="rounded-xl border border-[#252C3A] bg-[#0F141E] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8A9A]">
                Weighted Risk
              </span>
              <span className="font-mono text-xs tabular-nums text-[#FFB84D]">
                4.10 / 10
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#252C3A]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#45E08B] via-[#FFB84D] to-[#FF5D5D]"
                style={{ width: "41%" }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-[#7F8A9A]">Open</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-[#FF8B8B]">
                  2
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#7F8A9A]">Warning</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-[#FFD18A]">
                  1
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#7F8A9A]">Cash</p>
                <p className="font-mono text-lg font-semibold tabular-nums text-[#FF8B8B]">
                  8.00%
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {breaches.map((breach) => (
              <button
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  breach.id === selectedBreachId
                    ? "border-[#FF8A14]/70 bg-[#202633]"
                    : "border-[#252C3A] bg-[#111722] hover:border-[#3A4354]"
                }`}
                key={breach.id}
                onClick={() => setSelectedBreachId(breach.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-[#E8EDF2]">
                    {breach.id}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-[#7F8A9A]">
                    {breach.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[#AEB8C6]">
                  {breach.rule}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#252C3A] bg-[#0F141E] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold tabular-nums text-[#E8EDF2]">
              {selected?.id}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${severityClass}`}
            >
              {selected?.severity}
            </span>
            <span className="rounded-full bg-[#252C3A] px-2 py-1 text-[10px] text-[#AEB8C6]">
              {selected?.asset}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#F4F7FA]">
            {selected?.rule}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#AEB8C6]">
            {selected?.description}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetricTile label="Limit" value={selected?.limit ?? "--"} />
            <MetricTile
              label="Current"
              tone={selected?.current ? "warning" : "neutral"}
              value={selected?.current ?? "--"}
            />
            <MetricTile
              label="Detected"
              subvalue="UTC"
              value={
                selected
                  ? new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(new Date(selected.detectedAt))
                  : "--"
              }
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SortButton({
  children,
  active,
  direction,
  onClick,
  align = "left",
}: {
  children: ReactNode;
  active: boolean;
  direction: Direction;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      className={`flex w-full items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F8A9A] hover:text-[#E8EDF2] ${
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
      <span className="font-mono text-[9px]">
        {active ? (direction === "asc" ? "ASC" : "DESC") : ""}
      </span>
    </button>
  );
}

function RiskPill({ risk }: { risk: "LOW" | "MEDIUM" | "HIGH" }) {
  const className =
    risk === "HIGH"
      ? "bg-[#FF5D5D]/15 text-[#FF8B8B]"
      : risk === "MEDIUM"
        ? "bg-[#FFB84D]/15 text-[#FFD18A]"
        : "bg-[#45E08B]/15 text-[#8EE6A8]";

  return (
    <span
      className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold tabular-nums ${className}`}
    >
      {risk}
    </span>
  );
}

function PositionTables() {
  const [activeTable, setActiveTable] = useState<"stocks" | "options">("stocks");
  const [stockSort, setStockSort] = useState<{
    key: keyof StockPosition;
    direction: Direction;
  }>({ key: "marketValue", direction: "desc" });
  const [optionSort, setOptionSort] = useState<{
    key: keyof OptionPosition;
    direction: Direction;
  }>({ key: "notional", direction: "desc" });

  const sortedStocks = useMemo(
    () => sortRows(stockPositions, stockSort.key, stockSort.direction),
    [stockSort],
  );
  const sortedOptions = useMemo(
    () => sortRows(optionPositions, optionSort.key, optionSort.direction),
    [optionSort],
  );

  const setStockKey = (key: keyof StockPosition) => {
    setStockSort((current) => ({
      key,
      direction: current.key === key ? toggleDirection(current.direction) : "desc",
    }));
  };

  const setOptionKey = (key: keyof OptionPosition) => {
    setOptionSort((current) => ({
      key,
      direction: current.key === key ? toggleDirection(current.direction) : "desc",
    }));
  };

  return (
    <Panel
      action={
        <div className="flex rounded-full border border-[#252C3A] bg-[#0F141E] p-1">
          {(["stocks", "options"] as const).map((table) => (
            <button
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                activeTable === table
                  ? "bg-[#FF8A14] text-[#111722]"
                  : "text-[#7F8A9A] hover:text-[#E8EDF2]"
              }`}
              key={table}
              onClick={() => setActiveTable(table)}
              type="button"
            >
              {table}
            </button>
          ))}
        </div>
      }
      className="lg:col-span-7"
      eyebrow="positions"
      title="Stock and Options Book"
    >
      <div className="overflow-hidden rounded-xl border border-[#252C3A]">
        {activeTable === "stocks" ? (
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead className="bg-[#0F141E]">
              <tr>
                <th className="px-3 py-2">
                  <SortButton
                    active={stockSort.key === "symbol"}
                    direction={stockSort.direction}
                    onClick={() => setStockKey("symbol")}
                  >
                    Symbol
                  </SortButton>
                </th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Sector</th>
                <th className="px-3 py-2">
                  <SortButton
                    active={stockSort.key === "shares"}
                    align="right"
                    direction={stockSort.direction}
                    onClick={() => setStockKey("shares")}
                  >
                    Shares
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={stockSort.key === "marketValue"}
                    align="right"
                    direction={stockSort.direction}
                    onClick={() => setStockKey("marketValue")}
                  >
                    Value
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={stockSort.key === "weight"}
                    align="right"
                    direction={stockSort.direction}
                    onClick={() => setStockKey("weight")}
                  >
                    Weight
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={stockSort.key === "dayPnl"}
                    align="right"
                    direction={stockSort.direction}
                    onClick={() => setStockKey("dayPnl")}
                  >
                    Day P&L
                  </SortButton>
                </th>
                <th className="px-3 py-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252C3A] bg-[#111722]">
              {sortedStocks.map((row) => (
                <tr className="hover:bg-[#1B2230]" key={row.symbol}>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-[#F4F7FA]">
                    {row.symbol}
                  </td>
                  <td className="px-3 py-2 text-[#AEB8C6]">{row.name}</td>
                  <td className="px-3 py-2 text-[#7F8A9A]">{row.sector}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#E8EDF2]">
                    {row.shares.toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#E8EDF2]">
                    {row.marketValueLabel}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#AEB8C6]">
                    {row.weightLabel}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono tabular-nums ${directionFor(row.dayPnl)}`}
                  >
                    {row.dayPnlLabel}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <RiskPill risk={row.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[840px] border-collapse text-left text-xs">
            <thead className="bg-[#0F141E]">
              <tr>
                <th className="px-3 py-2">
                  <SortButton
                    active={optionSort.key === "contract"}
                    direction={optionSort.direction}
                    onClick={() => setOptionKey("contract")}
                  >
                    Contract
                  </SortButton>
                </th>
                <th className="px-3 py-2">Side</th>
                <th className="px-3 py-2">Expiry</th>
                <th className="px-3 py-2">
                  <SortButton
                    active={optionSort.key === "strike"}
                    align="right"
                    direction={optionSort.direction}
                    onClick={() => setOptionKey("strike")}
                  >
                    Strike
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={optionSort.key === "delta"}
                    align="right"
                    direction={optionSort.direction}
                    onClick={() => setOptionKey("delta")}
                  >
                    Delta
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={optionSort.key === "notional"}
                    align="right"
                    direction={optionSort.direction}
                    onClick={() => setOptionKey("notional")}
                  >
                    Notional
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={optionSort.key === "premium"}
                    align="right"
                    direction={optionSort.direction}
                    onClick={() => setOptionKey("premium")}
                  >
                    Premium
                  </SortButton>
                </th>
                <th className="px-3 py-2">
                  <SortButton
                    active={optionSort.key === "dayPnl"}
                    align="right"
                    direction={optionSort.direction}
                    onClick={() => setOptionKey("dayPnl")}
                  >
                    Day P&L
                  </SortButton>
                </th>
                <th className="px-3 py-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252C3A] bg-[#111722]">
              {sortedOptions.map((row) => (
                <tr className="hover:bg-[#1B2230]" key={row.contract}>
                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-[#F4F7FA]">
                    {row.contract}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold ${
                        row.side === "CALL"
                          ? "bg-[#45E08B]/15 text-[#8EE6A8]"
                          : "bg-[#69D2FF]/15 text-[#9FDEFF]"
                      }`}
                    >
                      {row.side}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-[#AEB8C6]">
                    {row.expiry}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#E8EDF2]">
                    {row.strike.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#E8EDF2]">
                    {row.delta.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#E8EDF2]">
                    {row.notionalLabel}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-[#AEB8C6]">
                    {row.premiumLabel}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono tabular-nums ${directionFor(row.dayPnl)}`}
                  >
                    {row.dayPnlLabel}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <RiskPill risk={row.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}

export default function FinancialDashboard() {
  const [selectedAsset, setSelectedAsset] = useState("Equities");
  const [selectedBreachId, setSelectedBreachId] = useState("BRC-1042");
  const selectedAllocation =
    allocations.find((allocation) => allocation.asset === selectedAsset) ??
    allocations[0];

  return (
    <main className="min-h-screen bg-[#0B0E14] px-4 py-5 text-[#E8EDF2] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 grid gap-4 rounded-2xl border border-[#252C3A] bg-[#111722] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#FF8A14]">
              Apex Asset Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#F4F7FA] sm:text-3xl">
              Apex Global Asset Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#AEB8C6]">
              Portfolio PORT-9921-X, updated 2026-06-23 15:30 UTC.
              Allocation, P&L, risk, and book exposure are aligned for dense
              trading-desk review.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right sm:grid-cols-4 lg:min-w-[720px]">
            <MetricTile label="Total AUM" value="$125,000,000.00" />
            <MetricTile
              label="Net P&L"
              tone="positive"
              value="+$5,180,500.00"
            />
            <MetricTile
              label="Daily"
              subvalue="-0.61%"
              tone="negative"
              value="-$312,750.00"
            />
            <MetricTile
              label="Cash Reserve"
              subvalue="Below floor"
              tone="warning"
              value="8.00%"
            />
          </div>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <MetricTile label="Realized P&L" tone="positive" value="+$980,000.00" />
          <MetricTile
            label="Unrealized P&L"
            tone="positive"
            value="+$4,200,500.00"
          />
          <MetricTile label="MTD P&L" tone="positive" value="+$2,870,300.00" />
          <MetricTile label="YTD P&L" tone="positive" value="+$11,450,900.00" />
          <MetricTile label="Weighted Risk" tone="warning" value="4.10" />
          <MetricTile label="Open Breaches" tone="negative" value="2" />
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <Panel
            action={
              <span className="font-mono text-xs tabular-nums text-[#AEB8C6]">
                Target drift: {selectedAllocation.driftLabel}
              </span>
            }
            className="lg:col-span-7"
            eyebrow="allocation"
            title="Labeled Allocation Chart"
          >
            <AllocationChart
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
            />
            <div className="mt-4 grid gap-2 rounded-xl border border-[#252C3A] bg-[#0F141E] p-3 sm:grid-cols-4">
              <MetricTile label="Selected" value={selectedAllocation.shortLabel} />
              <MetricTile label="Weight" value={selectedAllocation.weightLabel} />
              <MetricTile label="Target" value={selectedAllocation.targetLabel} />
              <MetricTile
                label="Risk"
                tone={selectedAllocation.riskScore >= 7 ? "negative" : "warning"}
                value={`${selectedAllocation.riskScore}/10`}
              />
            </div>
          </Panel>

          <Panel
            className="lg:col-span-5"
            eyebrow="p&l strip"
            title="Asset-Level P&L"
          >
            <div className="space-y-2">
              {pnlByAsset.map((row) => (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_120px_120px] items-center gap-3 rounded-xl border border-[#252C3A] bg-[#111722] px-3 py-2"
                  key={row.asset}
                >
                  <span className="truncate text-xs font-medium text-[#E8EDF2]">
                    {row.asset}
                  </span>
                  <span className="text-right font-mono text-xs tabular-nums text-[#E8EDF2]">
                    {row.netPnl}
                  </span>
                  <span
                    className={`text-right font-mono text-xs tabular-nums ${
                      row.direction === "down"
                        ? "text-[#FF5D5D]"
                        : "text-[#45E08B]"
                    }`}
                  >
                    {row.dailyChange}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <RiskPanel
            selectedBreachId={selectedBreachId}
            setSelectedBreachId={setSelectedBreachId}
          />
          <PositionTables />
        </div>
      </div>
    </main>
  );
}
