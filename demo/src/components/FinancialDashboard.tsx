"use client";

import { type ReactNode, useMemo, useState } from "react";

type PeriodKey = "daily" | "mtd" | "ytd";
type ComplianceFilter = "ALL" | "OPEN" | "WARNING";
type PnlSort = "net" | "daily";

type Allocation = {
  asset: string;
  value: string;
  valueNumber: number;
  riskScore: number;
  weightPct: string;
  weightNumber: number;
  targetPct: string;
  driftPct: string;
  color: string;
};

type PnlAsset = {
  asset: string;
  netPnl: string;
  netNumber: number;
  dailyChange: string;
  dailyNumber: number;
  direction: "up" | "down";
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

const portfolio = {
  id: "PORT-9921-X",
  clientName: "Apex Global Asset Management",
  lastUpdated: "2026-06-23 15:30 UTC",
  complianceStatus: "ACTION_REQUIRED",
  metrics: {
    totalAum: "$125,000,000.00",
    unrealizedPnl: "+$4,200,500.00",
    cashReserveRatio: "8.00%",
    weightedRisk: "4.10",
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
};

const allocations: Allocation[] = [
  {
    asset: "Equities",
    value: "$60,000,000.00",
    valueNumber: 60000000,
    riskScore: 4,
    weightPct: "48.00%",
    weightNumber: 48,
    targetPct: "50.00%",
    driftPct: "-2.00%",
    color: "#6EA8FE",
  },
  {
    asset: "Fixed Income",
    value: "$35,000,000.00",
    valueNumber: 35000000,
    riskScore: 2,
    weightPct: "28.00%",
    weightNumber: 28,
    targetPct: "28.00%",
    driftPct: "+0.00%",
    color: "#9AE6B4",
  },
  {
    asset: "Crypto/Digital Assets",
    value: "$15,000,000.00",
    valueNumber: 15000000,
    riskScore: 9,
    weightPct: "12.00%",
    weightNumber: 12,
    targetPct: "10.00%",
    driftPct: "+2.00%",
    color: "#F59E0B",
  },
  {
    asset: "Real Estate",
    value: "$8,000,000.00",
    valueNumber: 8000000,
    riskScore: 5,
    weightPct: "6.40%",
    weightNumber: 6.4,
    targetPct: "7.00%",
    driftPct: "-0.60%",
    color: "#C084FC",
  },
  {
    asset: "Commodities",
    value: "$4,000,000.00",
    valueNumber: 4000000,
    riskScore: 6,
    weightPct: "3.20%",
    weightNumber: 3.2,
    targetPct: "3.00%",
    driftPct: "+0.20%",
    color: "#F87171",
  },
  {
    asset: "Cash",
    value: "$3,000,000.00",
    valueNumber: 3000000,
    riskScore: 1,
    weightPct: "2.40%",
    weightNumber: 2.4,
    targetPct: "2.00%",
    driftPct: "+0.40%",
    color: "#67E8F9",
  },
];

const pnlByAsset: PnlAsset[] = [
  {
    asset: "Equities",
    netPnl: "+$3,120,000.00",
    netNumber: 3120000,
    dailyChange: "-$210,500.00",
    dailyNumber: -210500,
    direction: "down",
  },
  {
    asset: "Fixed Income",
    netPnl: "+$640,500.00",
    netNumber: 640500,
    dailyChange: "+$18,750.00",
    dailyNumber: 18750,
    direction: "up",
  },
  {
    asset: "Crypto/Digital Assets",
    netPnl: "+$1,980,000.00",
    netNumber: 1980000,
    dailyChange: "-$145,000.00",
    dailyNumber: -145000,
    direction: "down",
  },
  {
    asset: "Real Estate",
    netPnl: "+$215,000.00",
    netNumber: 215000,
    dailyChange: "+$9,500.00",
    dailyNumber: 9500,
    direction: "up",
  },
  {
    asset: "Commodities",
    netPnl: "-$775,000.00",
    netNumber: -775000,
    dailyChange: "+$14,500.00",
    dailyNumber: 14500,
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
    detectedAt: "2026-06-23 14:55 UTC",
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
    detectedAt: "2026-06-23 15:10 UTC",
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
    detectedAt: "2026-06-23 15:12 UTC",
    description:
      "Value-weighted risk score is trending toward the 4.0 advisory threshold.",
  },
];

const periodMetrics: Record<
  PeriodKey,
  {
    label: string;
    primary: string;
    secondary: string;
    note: string;
    colorClass: string;
  }
> = {
  daily: {
    label: "Daily",
    primary: portfolio.pnl.dailyChange,
    secondary: portfolio.pnl.dailyChangePct,
    note: "Intraday mark-to-market drawdown",
    colorClass: "text-[#FF6B6B]",
  },
  mtd: {
    label: "MTD",
    primary: portfolio.pnl.mtdPnl,
    secondary: portfolio.pnl.realizedPnl,
    note: "Month-to-date net P&L vs realized",
    colorClass: "text-[#41D98B]",
  },
  ytd: {
    label: "YTD",
    primary: portfolio.pnl.ytdPnl,
    secondary: portfolio.pnl.netPnl,
    note: "Year-to-date P&L vs current net",
    colorClass: "text-[#41D98B]",
  },
};

const statusTone: Record<string, string> = {
  ACTION_REQUIRED: "border-[#F59E0B] bg-[#2A1F0D] text-[#F6C46B]",
  OPEN: "border-[#FF6B6B] bg-[#2A1115] text-[#FF9A9A]",
  WARNING: "border-[#F59E0B] bg-[#2A1F0D] text-[#F6C46B]",
  CRITICAL: "border-[#FF6B6B] bg-[#2A1115] text-[#FF9A9A]",
  HIGH: "border-[#F59E0B] bg-[#2A1F0D] text-[#F6C46B]",
  MEDIUM: "border-[#C084FC] bg-[#20152C] text-[#D8B4FE]",
};

const numberClass = "font-mono [font-variant-numeric:tabular-nums]";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function riskTone(score: number) {
  if (score >= 8) {
    return "text-[#FF6B6B]";
  }

  if (score >= 5) {
    return "text-[#F6C46B]";
  }

  return "text-[#41D98B]";
}

function driftTone(drift: string) {
  if (drift.startsWith("-")) {
    return "text-[#FF9A9A]";
  }

  if (drift === "+0.00%") {
    return "text-[#A6ADBB]";
  }

  return "text-[#41D98B]";
}

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#283142] pb-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7F8AA3]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[#E7EBF3]">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
  intent = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  intent?: "neutral" | "good" | "bad" | "warn";
}) {
  const intentClass =
    intent === "good"
      ? "text-[#41D98B]"
      : intent === "bad"
        ? "text-[#FF6B6B]"
        : intent === "warn"
          ? "text-[#F6C46B]"
          : "text-[#DDE3EE]";

  return (
    <div className="rounded-md border border-[#283142] bg-[#161B26] px-3 py-2 shadow-[inset_0_1px_0_rgba(231,235,243,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8AA3]">
          {label}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
      </div>
      <div className={cx("mt-2 text-right text-lg font-semibold", numberClass, intentClass)}>
        {value}
      </div>
      <div className="mt-1 text-right text-[10px] text-[#8C96AA]">{detail}</div>
    </div>
  );
}

function FinancialDashboard() {
  const [period, setPeriod] = useState<PeriodKey>("daily");
  const [selectedAsset, setSelectedAsset] = useState(allocations[0].asset);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("ALL");
  const [pnlSort, setPnlSort] = useState<PnlSort>("net");

  const selectedAllocation = useMemo(
    () => allocations.find((allocation) => allocation.asset === selectedAsset) ?? allocations[0],
    [selectedAsset],
  );

  const sortedPnl = useMemo(() => {
    const key = pnlSort === "net" ? "netNumber" : "dailyNumber";

    return [...pnlByAsset].sort((left, right) => Math.abs(right[key]) - Math.abs(left[key]));
  }, [pnlSort]);

  const visibleBreaches = useMemo(() => {
    if (complianceFilter === "ALL") {
      return breaches;
    }

    return breaches.filter((breach) => breach.status === complianceFilter);
  }, [complianceFilter]);

  const maxNetPnl = Math.max(...pnlByAsset.map((asset) => Math.abs(asset.netNumber)));
  const maxDailyPnl = Math.max(...pnlByAsset.map((asset) => Math.abs(asset.dailyNumber)));
  const activePeriod = periodMetrics[period];

  return (
    <main className="min-h-screen bg-[#0B0E14] px-3 py-4 text-[#DDE3EE] sm:px-5 lg:px-6">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4">
        <header className="rounded-lg border border-[#283142] bg-[#10151F] p-4 shadow-2xl shadow-[#05070B]/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-[#344157] bg-[#161B26] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9BA6BC]">
                  Portfolio Command
                </span>
                <span
                  className={cx(
                    "rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    statusTone[portfolio.complianceStatus],
                  )}
                >
                  {portfolio.complianceStatus.replace("_", " ")}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#E7EBF3] sm:text-3xl">
                {portfolio.clientName}
              </h1>
              <p className="mt-1 text-xs text-[#8C96AA]">
                {portfolio.id} / Last updated {portfolio.lastUpdated}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-md border border-[#283142] bg-[#0D1119] p-1">
              {(Object.keys(periodMetrics) as PeriodKey[]).map((periodKey) => (
                <button
                  key={periodKey}
                  type="button"
                  onClick={() => setPeriod(periodKey)}
                  className={cx(
                    "rounded px-3 py-2 text-left transition hover:bg-[#1C2432]",
                    period === periodKey && "bg-[#233049] text-[#E7EBF3]",
                  )}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C96AA]">
                    {periodMetrics[periodKey].label}
                  </span>
                  <span
                    className={cx(
                      "mt-1 block text-sm font-semibold",
                      numberClass,
                      periodMetrics[periodKey].colorClass,
                    )}
                  >
                    {periodMetrics[periodKey].primary}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Total AUM"
            value={portfolio.metrics.totalAum}
            detail="Gross market value"
          />
          <MetricTile
            label="Net P&L"
            value={portfolio.pnl.netPnl}
            detail="Realized plus unrealized"
            intent="good"
          />
          <MetricTile
            label="Cash Reserve"
            value={portfolio.metrics.cashReserveRatio}
            detail="Minimum floor is 10.00%"
            intent="bad"
          />
          <MetricTile
            label="Weighted Risk"
            value={portfolio.metrics.weightedRisk}
            detail="Advisory ceiling is 4.00"
            intent="warn"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-lg border border-[#283142] bg-[#161B26] p-4">
            <SectionHeader
              eyebrow="Allocation Matrix"
              title="Current value, target, drift, and risk by asset"
              right={
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7F8AA3]">
                    Selected
                  </p>
                  <p className="text-xs font-semibold text-[#E7EBF3]">{selectedAllocation.asset}</p>
                </div>
              }
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="overflow-hidden rounded-md border border-[#283142]">
                <div className="grid grid-cols-[1.15fr_1fr_0.62fr_0.62fr_0.62fr] gap-2 bg-[#111722] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7F8AA3]">
                  <span>Asset</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">Weight</span>
                  <span className="text-right">Target</span>
                  <span className="text-right">Drift</span>
                </div>
                <div className="divide-y divide-[#283142]">
                  {allocations.map((allocation) => {
                    const isSelected = allocation.asset === selectedAsset;

                    return (
                      <button
                        key={allocation.asset}
                        type="button"
                        onClick={() => setSelectedAsset(allocation.asset)}
                        className={cx(
                          "grid w-full grid-cols-[1.15fr_1fr_0.62fr_0.62fr_0.62fr] items-center gap-2 px-3 py-2 text-left transition hover:bg-[#1C2432]",
                          isSelected && "bg-[#202A3A]",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: allocation.color }}
                            />
                            <span className="truncate text-xs font-semibold text-[#E7EBF3]">
                              {allocation.asset}
                            </span>
                          </span>
                          <span className={cx("mt-1 block text-[10px]", riskTone(allocation.riskScore))}>
                            Risk {allocation.riskScore}/10
                          </span>
                        </span>
                        <span className={cx("text-right text-xs text-[#DDE3EE]", numberClass)}>
                          {allocation.value}
                        </span>
                        <span className={cx("text-right text-xs text-[#DDE3EE]", numberClass)}>
                          {allocation.weightPct}
                        </span>
                        <span className={cx("text-right text-xs text-[#A6ADBB]", numberClass)}>
                          {allocation.targetPct}
                        </span>
                        <span className={cx("text-right text-xs font-semibold", numberClass, driftTone(allocation.driftPct))}>
                          {allocation.driftPct}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-md border border-[#283142] bg-[#10151F] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8AA3]">
                    Allocation Chart
                  </p>
                  <p className={cx("text-xs text-[#A6ADBB]", numberClass)}>Weight %</p>
                </div>
                <div className="mt-4 space-y-3">
                  {allocations.map((allocation) => (
                    <button
                      key={allocation.asset}
                      type="button"
                      onClick={() => setSelectedAsset(allocation.asset)}
                      className="group grid w-full grid-cols-[92px_1fr_48px] items-center gap-2 text-left"
                      aria-label={`${allocation.asset} allocation ${allocation.weightPct}`}
                    >
                      <span className="truncate text-[11px] text-[#A6ADBB] group-hover:text-[#E7EBF3]">
                        {allocation.asset}
                      </span>
                      <span className="h-2 rounded-full bg-[#283142]">
                        <span
                          className="block h-2 rounded-full transition-all"
                          style={{
                            width: `${allocation.weightNumber}%`,
                            backgroundColor: allocation.color,
                            opacity: allocation.asset === selectedAsset ? 1 : 0.68,
                          }}
                        />
                      </span>
                      <span className={cx("text-right text-[11px] text-[#DDE3EE]", numberClass)}>
                        {allocation.weightPct}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded border border-[#344157] bg-[#0D1119] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#7F8AA3]">
                    Selected Asset Detail
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-[#8C96AA]">Value</p>
                      <p className={cx("text-sm font-semibold text-[#E7EBF3]", numberClass)}>
                        {selectedAllocation.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8C96AA]">Risk</p>
                      <p className={cx("text-sm font-semibold", numberClass, riskTone(selectedAllocation.riskScore))}>
                        {selectedAllocation.riskScore}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8C96AA]">Target</p>
                      <p className={cx("text-sm font-semibold text-[#E7EBF3]", numberClass)}>
                        {selectedAllocation.targetPct}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8C96AA]">Drift</p>
                      <p className={cx("text-sm font-semibold", numberClass, driftTone(selectedAllocation.driftPct))}>
                        {selectedAllocation.driftPct}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#283142] bg-[#161B26] p-4">
            <SectionHeader
              eyebrow="P&L Monitor"
              title={`${activePeriod.label} performance focus`}
              right={
                <div className="text-right">
                  <p className={cx("text-lg font-semibold", numberClass, activePeriod.colorClass)}>
                    {activePeriod.primary}
                  </p>
                  <p className={cx("text-[10px] text-[#8C96AA]", numberClass)}>
                    {activePeriod.secondary}
                  </p>
                </div>
              }
            />

            <p className="mt-3 text-xs text-[#A6ADBB]">{activePeriod.note}</p>

            <div className="mt-4 rounded-md border border-[#283142] bg-[#10151F] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8AA3]">
                  Fully Labeled Net P&L Bars
                </p>
                <div className="flex rounded border border-[#344157] bg-[#0D1119] p-0.5">
                  {(["net", "daily"] as PnlSort[]).map((sortKey) => (
                    <button
                      key={sortKey}
                      type="button"
                      onClick={() => setPnlSort(sortKey)}
                      className={cx(
                        "rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C96AA]",
                        pnlSort === sortKey && "bg-[#233049] text-[#E7EBF3]",
                      )}
                    >
                      {sortKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {sortedPnl.map((asset) => {
                  const allocation = allocations.find((item) => item.asset === asset.asset);
                  const width = Math.max(6, (Math.abs(asset.netNumber) / maxNetPnl) * 100);

                  return (
                    <button
                      key={asset.asset}
                      type="button"
                      onClick={() => setSelectedAsset(asset.asset)}
                      className="grid w-full grid-cols-[116px_1fr_112px] items-center gap-2 text-left"
                      aria-label={`${asset.asset} net P&L ${asset.netPnl} daily change ${asset.dailyChange}`}
                    >
                      <span className="truncate text-[11px] text-[#A6ADBB]">{asset.asset}</span>
                      <span className="relative h-5 rounded bg-[#283142]">
                        <span
                          className={cx(
                            "absolute left-0 top-0 h-5 rounded",
                            asset.netNumber >= 0 ? "bg-[#2E7D5C]" : "bg-[#8A3342]",
                          )}
                          style={{
                            width: `${width}%`,
                            backgroundColor: allocation?.color,
                            opacity: asset.netNumber >= 0 ? 0.86 : 0.7,
                          }}
                        />
                        <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold text-[#0B0E14]">
                          {asset.direction === "up" ? "Gain" : "Drawdown"}
                        </span>
                      </span>
                      <span className={cx("text-right text-[11px] font-semibold", numberClass, asset.netNumber >= 0 ? "text-[#41D98B]" : "text-[#FF6B6B]")}>
                        {asset.netPnl}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-md border border-[#283142]">
              <div className="grid grid-cols-[1fr_0.82fr_0.82fr] bg-[#111722] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7F8AA3]">
                <span>Asset</span>
                <button
                  type="button"
                  onClick={() => setPnlSort("net")}
                  className="text-right"
                >
                  Net P&L
                </button>
                <button
                  type="button"
                  onClick={() => setPnlSort("daily")}
                  className="text-right"
                >
                  Daily Delta
                </button>
              </div>
              <div className="divide-y divide-[#283142]">
                {sortedPnl.map((asset) => {
                  const dailyWidth = Math.max(5, (Math.abs(asset.dailyNumber) / maxDailyPnl) * 100);

                  return (
                    <div
                      key={asset.asset}
                      className="grid grid-cols-[1fr_0.82fr_0.82fr] items-center px-3 py-2 text-xs"
                    >
                      <span className="truncate text-[#DDE3EE]">{asset.asset}</span>
                      <span className={cx("text-right font-semibold", numberClass, asset.netNumber >= 0 ? "text-[#41D98B]" : "text-[#FF6B6B]")}>
                        {asset.netPnl}
                      </span>
                      <span className="flex items-center justify-end gap-2">
                        <span className="hidden h-1.5 w-12 rounded bg-[#283142] sm:block">
                          <span
                            className={cx(
                              "block h-1.5 rounded",
                              asset.dailyNumber >= 0 ? "bg-[#41D98B]" : "bg-[#FF6B6B]",
                            )}
                            style={{ width: `${dailyWidth}%` }}
                          />
                        </span>
                        <span className={cx("font-semibold", numberClass, asset.dailyNumber >= 0 ? "text-[#41D98B]" : "text-[#FF6B6B]")}>
                          {asset.dailyChange}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-lg border border-[#283142] bg-[#161B26] p-4">
            <SectionHeader
              eyebrow="Exposure Snapshot"
              title="Capital, risk, and liquidity alignment"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricTile
                label="Unrealized"
                value={portfolio.metrics.unrealizedPnl}
                detail="Open mark-to-market"
                intent="good"
              />
              <MetricTile
                label="Realized"
                value={portfolio.pnl.realizedPnl}
                detail="Closed P&L"
                intent="good"
              />
              <MetricTile
                label="Open Breaches"
                value="2"
                detail="Critical plus high"
                intent="bad"
              />
              <MetricTile
                label="Warnings"
                value="1"
                detail="Portfolio advisory"
                intent="warn"
              />
            </div>
            <div className="mt-4 rounded-md border border-[#283142] bg-[#10151F] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7F8AA3]">
                Risk Distribution
              </p>
              <div className="mt-3 space-y-2">
                {allocations.map((allocation) => (
                  <div
                    key={allocation.asset}
                    className="grid grid-cols-[104px_1fr_34px] items-center gap-2"
                  >
                    <span className="truncate text-[11px] text-[#A6ADBB]">{allocation.asset}</span>
                    <span className="h-1.5 rounded-full bg-[#283142]">
                      <span
                        className={cx(
                          "block h-1.5 rounded-full",
                          allocation.riskScore >= 8
                            ? "bg-[#FF6B6B]"
                            : allocation.riskScore >= 5
                              ? "bg-[#F6C46B]"
                              : "bg-[#41D98B]",
                        )}
                        style={{ width: `${allocation.riskScore * 10}%` }}
                      />
                    </span>
                    <span className={cx("text-right text-[11px]", numberClass, riskTone(allocation.riskScore))}>
                      {allocation.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#283142] bg-[#161B26] p-4">
            <SectionHeader
              eyebrow="Compliance Queue"
              title="Open mandates and advisory exceptions"
              right={
                <div className="flex rounded border border-[#344157] bg-[#0D1119] p-0.5">
                  {(["ALL", "OPEN", "WARNING"] as ComplianceFilter[]).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setComplianceFilter(filter)}
                      className={cx(
                        "rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8C96AA]",
                        complianceFilter === filter && "bg-[#233049] text-[#E7EBF3]",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              }
            />

            <div className="mt-4 overflow-hidden rounded-md border border-[#283142]">
              <div className="grid grid-cols-[0.6fr_1.35fr_0.72fr_0.52fr_0.52fr] gap-2 bg-[#111722] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7F8AA3]">
                <span>ID</span>
                <span>Rule</span>
                <span>Asset</span>
                <span className="text-right">Limit</span>
                <span className="text-right">Current</span>
              </div>
              <div className="divide-y divide-[#283142]">
                {visibleBreaches.map((breach) => (
                  <article
                    key={breach.id}
                    className="grid grid-cols-[0.6fr_1.35fr_0.72fr_0.52fr_0.52fr] gap-2 px-3 py-3 text-xs"
                  >
                    <div>
                      <p className={cx("font-semibold text-[#E7EBF3]", numberClass)}>{breach.id}</p>
                      <p className="mt-1 text-[10px] text-[#7F8AA3]">{breach.detectedAt}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#E7EBF3]">{breach.rule}</p>
                      <p className="mt-1 text-[11px] leading-4 text-[#A6ADBB]">{breach.description}</p>
                    </div>
                    <div>
                      <p className="truncate text-[#DDE3EE]">{breach.asset}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span
                          className={cx(
                            "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                            statusTone[breach.severity],
                          )}
                        >
                          {breach.severity}
                        </span>
                        <span
                          className={cx(
                            "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                            statusTone[breach.status],
                          )}
                        >
                          {breach.status}
                        </span>
                      </div>
                    </div>
                    <p className={cx("text-right text-[#A6ADBB]", numberClass)}>
                      {breach.limit ?? "N/A"}
                    </p>
                    <p className={cx("text-right font-semibold text-[#F6C46B]", numberClass)}>
                      {breach.current ?? "N/A"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default FinancialDashboard;
