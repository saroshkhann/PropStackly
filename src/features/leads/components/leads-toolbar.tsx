"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FacetFilter } from "@/components/shared/facet-filter";
import { SearchInput } from "@/components/shared/search-input";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadSource,
} from "@/domain/lead";
import type { AgentOption } from "@/features/workspace/types";
import type { LeadListItem } from "../data/types";
import { countBy, hasActiveFilters, UNASSIGNED, type LeadFilters } from "../lib/lead-filters";

interface LeadsToolbarProps {
  leads: LeadListItem[];
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
  sources: LeadSource[];
  agents: AgentOption[];
}

export function LeadsToolbar({ leads, filters, onChange, sources, agents }: LeadsToolbarProps) {
  const set = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => onChange({ ...filters, [key]: value });
  const statusCounts = countBy(leads, (lead) => lead.status);
  const sourceCounts = countBy(leads, (lead) => lead.sourceId);
  const priorityCounts = countBy(leads, (lead) => lead.priority);
  const agentCounts = countBy(leads, (lead) => lead.assignedToId ?? UNASSIGNED);

  return (
    <div className="flex flex-col gap-3 px-5 pb-4 lg:flex-row lg:items-center">
      <SearchInput
        value={filters.query}
        onChange={(query) => set("query", query)}
        placeholder="Search name, phone, area…"
        label="Search leads"
        className="lg:w-72"
      />
      <div className="flex flex-wrap items-center gap-2">
        <FacetFilter
          title="Status"
          selected={filters.statuses}
          onChange={(value) => set("statuses", value)}
          options={LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_LABELS[status], count: statusCounts.get(status) ?? 0 }))}
        />
        <FacetFilter
          title="Source"
          selected={filters.sources}
          onChange={(value) => set("sources", value)}
          options={sources.map((source) => ({ value: source.id, label: source.label, count: sourceCounts.get(source.id) ?? 0 }))}
        />
        <FacetFilter
          title="Priority"
          selected={filters.priorities}
          onChange={(value) => set("priorities", value)}
          options={LEAD_PRIORITIES.map((priority) => ({ value: priority, label: LEAD_PRIORITY_LABELS[priority], count: priorityCounts.get(priority) ?? 0 }))}
        />
        <FacetFilter
          title="Agent"
          searchable
          selected={filters.agents}
          onChange={(value) => set("agents", value)}
          options={[
            ...agents.map((agent) => ({ value: agent.id, label: agent.name, count: agentCounts.get(agent.id) ?? 0 })),
            { value: UNASSIGNED, label: "Unassigned", count: agentCounts.get(UNASSIGNED) ?? 0 },
          ]}
        />
        {hasActiveFilters(filters) && (
          <Button variant="ghost" onClick={() => onChange({ query: "", statuses: [], sources: [], priorities: [], agents: [] })}>
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
