import type { VisitStatus } from "@/domain/site-visit";
import { dayKey } from "@/lib/format";
import type { VisitItem } from "../data/types";

export interface VisitFilters {
  query: string;
  statuses: VisitStatus[];
  agents: string[];
}

export const emptyVisitFilters: VisitFilters = { query: "", statuses: [], agents: [] };

export function filterVisits(visits: VisitItem[], filters: VisitFilters) {
  const query = filters.query.toLowerCase().trim();
  return visits.filter((v) => {
    if (query && ![v.title, v.customerName, v.meetingPoint, v.agent?.name ?? ""].join(" ").toLowerCase().includes(query)) return false;
    if (filters.statuses.length && !filters.statuses.includes(v.status)) return false;
    if (filters.agents.length && !filters.agents.includes(v.assignedToId)) return false;
    return true;
  });
}

export function isUpcoming(visit: VisitItem, now: string) {
  return (visit.status === "scheduled" || visit.status === "confirmed") && new Date(visit.startsAt).getTime() >= new Date(now).getTime();
}

/** Scheduled or confirmed visits whose time has passed without an outcome being logged. */
export function needsOutcome(visit: VisitItem, now: string) {
  return (visit.status === "scheduled" || visit.status === "confirmed") && new Date(visit.startsAt).getTime() < new Date(now).getTime();
}

export function summarizeVisits(visits: VisitItem[], now: string) {
  const today = dayKey(now);
  const weekEnd = dayKey(new Date(new Date(now).getTime() + 7 * 86_400_000).toISOString());
  const month = today.slice(0, 7);
  const completed = visits.filter((v) => v.status === "completed" && dayKey(v.startsAt).startsWith(month));
  const positive = completed.filter((v) => v.outcome === "offer_made" || v.outcome === "very_interested" || v.outcome === "interested");
  return {
    today: visits.filter((v) => dayKey(v.startsAt) === today && v.status !== "cancelled").length,
    thisWeek: visits.filter((v) => isUpcoming(v, now) && dayKey(v.startsAt) <= weekEnd).length,
    completedThisMonth: completed.length,
    positiveRate: completed.length ? positive.length / completed.length : 0,
    offers: completed.filter((v) => v.outcome === "offer_made").length,
    needsOutcome: visits.filter((v) => needsOutcome(v, now)).length,
  };
}

/** Six Monday-first weeks covering the month, as YYYY-MM-DD keys. */
export function monthGrid(month: string) {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, monthIndex - 1, 1 - offset + i)).toISOString().slice(0, 10));
}

export function shiftMonth(month: string, delta: number) {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(year, monthIndex - 1 + delta, 1)).toISOString().slice(0, 7);
}

export function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}
