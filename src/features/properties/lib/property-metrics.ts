import { PROPERTY_STATUSES, type PropertyStatus } from "@/domain/property";
import type { PropertyListItem } from "../data/types";

const DAY_MS = 86_400_000;

export function summarizeProperties(properties: PropertyListItem[], now: string) {
  const nowMs = new Date(now).getTime();
  const active = properties.filter((p) => p.status === "available" || p.status === "under_offer");
  const byStatus = PROPERTY_STATUSES.map((status) => ({
    status,
    count: properties.filter((p) => p.status === status).length,
  })) satisfies { status: PropertyStatus; count: number }[];

  const locationCounts = new Map<string, number>();
  for (const p of active) locationCounts.set(p.location, (locationCounts.get(p.location) ?? 0) + 1);

  return {
    total: properties.length,
    activeForSale: active.filter((p) => p.purpose === "sale").length,
    activeForRent: active.filter((p) => p.purpose === "rent").length,
    underOffer: properties.filter((p) => p.status === "under_offer").length,
    saleInventoryValue: active.filter((p) => p.purpose === "sale").reduce((sum, p) => sum + p.pricePKR, 0),
    avgDaysOnMarket: active.length
      ? Math.round(active.reduce((sum, p) => sum + (nowMs - new Date(p.listedAt).getTime()) / DAY_MS, 0) / active.length)
      : 0,
    newInquiries: properties.reduce((sum, p) => sum + p.openInquiryCount, 0),
    unassigned: active.filter((p) => !p.assignedAgentId).length,
    byStatus,
    topLocations: [...locationCounts.entries()]
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  };
}

export function daysOnMarket(listedAt: string, now: string) {
  return Math.max(0, Math.round((new Date(now).getTime() - new Date(listedAt).getTime()) / DAY_MS));
}
