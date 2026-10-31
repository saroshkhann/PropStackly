import { OPEN_LEAD_STATUSES } from "@/domain/lead";
import type { LeadListItem } from "../data/types";

const WEEK_MS = 7 * 24 * 3_600_000;

export function summarizeLeads(leads: LeadListItem[], now: string) {
  const nowMs = new Date(now).getTime();
  const open = leads.filter((lead) => OPEN_LEAD_STATUSES.includes(lead.status));
  const won = leads.filter((lead) => lead.status === "won").length;
  const lost = leads.filter((lead) => lead.status === "lost").length;
  return {
    total: leads.length,
    open: open.length,
    newThisWeek: leads.filter((lead) => nowMs - new Date(lead.createdAt).getTime() <= WEEK_MS).length,
    hot: open.filter((lead) => lead.priority === "hot").length,
    unassigned: open.filter((lead) => !lead.assignedToId).length,
    winRate: won + lost ? won / (won + lost) : 0,
    closed: won + lost,
  };
}
