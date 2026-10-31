import { Building2, Clock3, Handshake, MessageSquareText } from "lucide-react";
import { HorizontalBarList } from "@/components/charts/horizontal-bar-list";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { PROPERTY_STATUS_LABELS, type PropertyStatus } from "@/domain/property";
import { formatNumber, formatPercent, formatPKRCompact } from "@/lib/format";
import type { summarizeProperties } from "../lib/property-metrics";

const statusColors: Record<PropertyStatus, string> = {
  available: "var(--success)",
  under_offer: "var(--warning)",
  sold: "var(--brand)",
  rented: "var(--info)",
  off_market: "var(--border-strong)",
};

type Summary = ReturnType<typeof summarizeProperties>;

export function PropertiesOverview({ summary }: { summary: Summary }) {
  const shown = summary.byStatus.filter((s) => s.count > 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Active listings"
          icon={Building2}
          value={formatNumber(summary.activeForSale + summary.activeForRent)}
          hint={`${summary.activeForSale} for sale · ${summary.activeForRent} for rent`}
        />
        <StatCard label="Under offer" icon={Handshake} value={formatNumber(summary.underOffer)} hint={`${formatPKRCompact(summary.saleInventoryValue)} active sale inventory`} />
        <StatCard
          label="New inquiries"
          icon={MessageSquareText}
          value={formatNumber(summary.newInquiries)}
          hint="Awaiting a first response"
          tone={summary.newInquiries > 0 ? "attention" : "default"}
        />
        <StatCard
          label="Avg. days on market"
          icon={Clock3}
          value={formatNumber(summary.avgDaysOnMarket)}
          hint={summary.unassigned ? `${summary.unassigned} active listings without an agent` : "Every active listing has an agent"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <SectionCard title="Listing status" description={`${summary.total} listings in inventory`} className="xl:col-span-7">
          <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Listings by status">
            {shown.map((s) => (
              <span key={s.status} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(s.count / summary.total) * 100}%`, backgroundColor: statusColors[s.status] }} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {summary.byStatus.map((s) => (
              <li key={s.status} className="flex items-center gap-2 text-[13px]">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: statusColors[s.status] }} aria-hidden />
                <span className="text-muted-foreground">{PROPERTY_STATUS_LABELS[s.status]}</span>
                <span className="ml-auto font-semibold tabular">{s.count}</span>
                <span className="w-10 text-right text-xs text-muted-foreground tabular">{formatPercent(summary.total ? s.count / summary.total : 0)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Active listings by area" description="Where your available inventory sits" className="xl:col-span-5">
          <HorizontalBarList
            ariaLabel="Active listings by area"
            items={summary.topLocations.map((l) => ({
              key: l.location,
              label: l.location,
              value: l.count,
              primary: formatNumber(l.count),
              tooltip: `${l.location}: ${l.count} active listings`,
            }))}
          />
        </SectionCard>
      </div>
    </div>
  );
}
