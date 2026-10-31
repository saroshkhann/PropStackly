import type { AgencyMember } from "@/domain/agency";
import type { DailyActivity, MonthlySales } from "@/domain/analytics";
import { isOpenStage, type Deal, type PipelineStage, type PipelineStageId } from "@/domain/deal";
import type { LeadSource, LeadSourceId } from "@/domain/lead";
import type { Property } from "@/domain/property";
import { dayKey, formatDate } from "@/lib/format";

export type RangeKey = "7d" | "30d" | "90d";

export const RANGE_OPTIONS: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

export const rangeDays = (key: RangeKey) => RANGE_OPTIONS.find((option) => option.key === key)!.days;

export interface ActivityTotals {
  newLeads: number;
  siteVisits: number;
  dealsClosed: number;
  revenuePKR: number;
  listingsAdded: number;
}

export interface ActivityPoint extends ActivityTotals {
  key: string;
  label: string;
  rangeLabel: string;
}

const emptyTotals = (): ActivityTotals => ({ newLeads: 0, siteVisits: 0, dealsClosed: 0, revenuePKR: 0, listingsAdded: 0 });

function addDay(totals: ActivityTotals, day: DailyActivity, listings: number) {
  totals.newLeads += day.newLeads;
  totals.siteVisits += day.siteVisits;
  totals.dealsClosed += day.dealsClosed;
  totals.revenuePKR += day.revenuePKR;
  totals.listingsAdded += listings;
}

function listingsPerDay(listingDates: string[]) {
  const counts = new Map<string, number>();
  for (const date of listingDates) {
    const key = dayKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function relativeChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 1;
  return (current - previous) / previous;
}

/** Totals for the trailing window and the equal-length window before it. */
export function summarizeRange(activity: DailyActivity[], listingDates: string[], days: number) {
  const listings = listingsPerDay(listingDates);
  const current = emptyTotals();
  const previous = emptyTotals();
  const end = activity.length;
  activity.slice(Math.max(0, end - days), end).forEach((day) => addDay(current, day, listings.get(dayKey(day.date)) ?? 0));
  activity
    .slice(Math.max(0, end - days * 2), Math.max(0, end - days))
    .forEach((day) => addDay(previous, day, listings.get(dayKey(day.date)) ?? 0));
  return { current, previous };
}

export const seriesGranularity = (days: number) => (days > 45 ? "weekly" : "daily");

/** Daily points for short ranges, weekly buckets for long ones so the chart stays legible. */
export function activitySeries(activity: DailyActivity[], listingDates: string[], days: number): ActivityPoint[] {
  const listings = listingsPerDay(listingDates);
  const window = activity.slice(-days);
  const bucketSize = seriesGranularity(days) === "weekly" ? 7 : 1;
  const points: ActivityPoint[] = [];

  for (let start = window.length % bucketSize; start < window.length; start += bucketSize) {
    const bucket = window.slice(start, start + bucketSize);
    const totals = emptyTotals();
    bucket.forEach((day) => addDay(totals, day, listings.get(dayKey(day.date)) ?? 0));
    const first = bucket[0]!;
    const last = bucket[bucket.length - 1]!;
    points.push({
      ...totals,
      key: dayKey(first.date),
      label: formatDate(first.date, "dayMonth"),
      rangeLabel:
        bucketSize === 1
          ? formatDate(first.date, "weekday")
          : `${formatDate(first.date, "dayMonth")} – ${formatDate(last.date, "dayMonth")}`,
    });
  }
  return points;
}

export interface SourceBreakdown {
  id: LeadSourceId;
  label: string;
  count: number;
  share: number;
}

export function leadSourceBreakdown(
  totalLeads: number,
  sources: LeadSource[],
  weights: Record<LeadSourceId, number>,
): SourceBreakdown[] {
  const rows = sources.map((source) => ({ ...source, count: Math.round(totalLeads * weights[source.id]) }));
  const drift = totalLeads - rows.reduce((sum, row) => sum + row.count, 0);
  if (rows[0]) rows[0].count += drift;
  return rows
    .map((row) => ({ ...row, share: totalLeads ? row.count / totalLeads : 0 }))
    .sort((a, b) => b.count - a.count);
}

export interface StageSummary {
  id: PipelineStageId;
  label: string;
  count: number;
  valuePKR: number;
}

export function summarizePipeline(deals: Deal[], stages: PipelineStage[]) {
  const rows: StageSummary[] = [...stages]
    .filter((stage) => stage.outcome !== "lost")
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const inStage = deals.filter((deal) => deal.stageId === stage.id);
      return {
        id: stage.id,
        label: stage.label,
        count: inStage.length,
        valuePKR: inStage.reduce((sum, deal) => sum + deal.valuePKR, 0),
      };
    });
  const open = rows.filter((row) => isOpenStage(row.id));
  return {
    stages: rows,
    openCount: open.reduce((sum, row) => sum + row.count, 0),
    openValuePKR: open.reduce((sum, row) => sum + row.valuePKR, 0),
  };
}

export function summarizeInventory(properties: Property[]) {
  return {
    total: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    underOffer: properties.filter((p) => p.status === "under_offer").length,
  };
}

const monthKey = (iso: string) => dayKey(iso).slice(0, 7);

export function monthlySales(activity: DailyActivity[], targetPKR: number, months = 6): MonthlySales[] {
  const byMonth = new Map<string, MonthlySales>();
  for (const day of activity) {
    const key = monthKey(day.date);
    const entry = byMonth.get(key) ?? { month: formatDate(day.date, "month"), revenuePKR: 0, targetPKR, dealsClosed: 0 };
    entry.revenuePKR += day.revenuePKR;
    entry.dealsClosed += day.dealsClosed;
    byMonth.set(key, entry);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-months)
    .map(([, value]) => value);
}

export interface AgentPerformance {
  id: string;
  name: string;
  title: string;
  closedValuePKR: number;
  closedDeals: number;
  openDeals: number;
  targetPKR: number;
  attainment: number;
}

export function agentLeaderboard(members: AgencyMember[], deals: Deal[]): AgentPerformance[] {
  return members
    .filter((member) => member.monthlyTargetPKR > 0)
    .map((member) => {
      const owned = deals.filter((deal) => deal.ownerId === member.id);
      const closed = owned.filter((deal) => deal.stageId === "closed_won");
      const closedValuePKR = closed.reduce((sum, deal) => sum + deal.valuePKR, 0);
      return {
        id: member.id,
        name: member.name,
        title: member.title,
        closedValuePKR,
        closedDeals: closed.length,
        openDeals: owned.length - closed.length,
        targetPKR: member.monthlyTargetPKR,
        attainment: closedValuePKR / member.monthlyTargetPKR,
      };
    })
    .sort((a, b) => b.closedValuePKR - a.closedValuePKR || b.openDeals - a.openDeals);
}
