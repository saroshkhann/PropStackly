import type { LeadPriority, LeadSourceId, LeadStatus } from "@/domain/lead";
import type { LeadListItem } from "../data/types";

export const UNASSIGNED = "unassigned";

export interface LeadFilters {
  query: string;
  statuses: LeadStatus[];
  sources: LeadSourceId[];
  priorities: LeadPriority[];
  /** Agent ids, or `UNASSIGNED`. */
  agents: string[];
}

export const emptyLeadFilters: LeadFilters = { query: "", statuses: [], sources: [], priorities: [], agents: [] };

export function hasActiveFilters(filters: LeadFilters) {
  return Boolean(filters.query.trim()) || filters.statuses.length + filters.sources.length + filters.priorities.length + filters.agents.length > 0;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s-]+/g, " ").trim();
}

export function filterLeads(leads: LeadListItem[], filters: LeadFilters) {
  const query = normalize(filters.query);
  const digits = filters.query.replace(/\D/g, "");
  return leads.filter((lead) => {
    if (query) {
      const haystack = normalize([lead.name, lead.interest, lead.location, lead.sourceLabel, lead.assignedTo?.name ?? ""].join(" "));
      const phoneMatch = digits.length >= 3 && lead.phoneMasked.replace(/\D/g, "").includes(digits);
      if (!haystack.includes(query) && !phoneMatch) return false;
    }
    if (filters.statuses.length && !filters.statuses.includes(lead.status)) return false;
    if (filters.sources.length && !filters.sources.includes(lead.sourceId)) return false;
    if (filters.priorities.length && !filters.priorities.includes(lead.priority)) return false;
    if (filters.agents.length && !filters.agents.includes(lead.assignedToId ?? UNASSIGNED)) return false;
    return true;
  });
}

/** Counts per facet value across the full list, so filter menus show where leads are. */
export function countBy<T extends string>(leads: LeadListItem[], key: (lead: LeadListItem) => T) {
  const counts = new Map<T, number>();
  for (const lead of leads) counts.set(key(lead), (counts.get(key(lead)) ?? 0) + 1);
  return counts;
}
