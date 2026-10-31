import { Building2, Handshake, TrendingUp, UsersRound } from "lucide-react";
import { formatNumber, formatPKRCompact, formatPercent } from "@/lib/format";
import { relativeChange, type ActivityPoint, type ActivityTotals } from "../lib/metrics";
import type { DashboardData } from "../data/types";
import { KpiCard } from "./kpi-card";

interface KpiGridProps {
  current: ActivityTotals;
  previous: ActivityTotals;
  series: ActivityPoint[];
  rangeLabel: string;
  inventory: DashboardData["inventory"];
  pipeline: DashboardData["pipeline"];
}

export function KpiGrid({ current, previous, series, rangeLabel, inventory, pipeline }: KpiGridProps) {
  const comparison = `vs previous ${rangeLabel}`;
  const conversion = current.newLeads ? current.dealsClosed / current.newLeads : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="New leads"
        icon={UsersRound}
        value={formatNumber(current.newLeads)}
        delta={relativeChange(current.newLeads, previous.newLeads)}
        comparison={comparison}
        trend={series.map((p) => p.newLeads)}
        footnote={<><span className="font-medium text-foreground tabular">{formatNumber(current.siteVisits)}</span> site visits booked</>}
      />
      <KpiCard
        label="Active listings"
        icon={Building2}
        value={formatNumber(inventory.available)}
        comparison={`${formatNumber(current.listingsAdded)} new listings in ${rangeLabel}`}
        trend={series.map((p) => p.listingsAdded)}
        footnote={<><span className="font-medium text-foreground tabular">{inventory.underOffer}</span> under offer · {inventory.total} in inventory</>}
      />
      <KpiCard
        label="Active deals"
        icon={Handshake}
        value={formatNumber(pipeline.openCount)}
        comparison="Open across all pipeline stages"
        trend={series.map((p) => p.siteVisits)}
        footnote={<><span className="font-medium text-foreground tabular">{formatPKRCompact(pipeline.openValuePKR)}</span> pipeline value</>}
      />
      <KpiCard
        label="Sales closed"
        icon={TrendingUp}
        unit="PKR"
        value={formatPKRCompact(current.revenuePKR, { prefix: false })}
        delta={relativeChange(current.revenuePKR, previous.revenuePKR)}
        comparison={comparison}
        trend={series.map((p) => p.revenuePKR)}
        footnote={<><span className="font-medium text-foreground tabular">{current.dealsClosed}</span> deals · {formatPercent(conversion)} lead-to-sale</>}
      />
    </div>
  );
}
