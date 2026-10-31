"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Plus, SearchX, UsersRound } from "lucide-react";
import { toast } from "sonner";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";
import { notifyDemoAction } from "@/lib/demo";
import { maskPhone } from "@/lib/validation";
import type { LeadListItem, LeadsPageData } from "../data/types";
import { emptyLeadFilters, filterLeads, hasActiveFilters, type LeadFilters } from "../lib/lead-filters";
import { summarizeLeads } from "../lib/lead-metrics";
import type { LeadFormValues } from "../lib/lead-schema";
import { AddLeadSheet } from "./add-lead-sheet";
import { BulkActionsBar } from "./bulk-actions-bar";
import { LeadsStats } from "./leads-stats";
import { LeadsTable } from "./leads-table";
import { LeadsToolbar } from "./leads-toolbar";

const sessionOnly = "Demo only — this change lives in your browser session and resets on reload.";

export function LeadsView({ data }: { data: LeadsPageData }) {
  const [leads, setLeads] = useState<LeadListItem[]>(data.leads);
  const [filters, setFilters] = useState<LeadFilters>(emptyLeadFilters);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const summary = useMemo(() => summarizeLeads(leads, data.now), [leads, data.now]);
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const agentsById = useMemo(() => new Map(data.agents.map((agent) => [agent.id, agent])), [data.agents]);

  const onRowSelectionChange = useCallback((updater: Updater<RowSelectionState>) => {
    setRowSelection((previous) => (typeof updater === "function" ? updater(previous) : updater));
  }, []);

  const updateFilters = (next: LeadFilters) => {
    setFilters(next);
    setRowSelection({});
  };

  const onAssign = useCallback(
    (leadIds: string[], agentId: string | null) => {
      const agent = agentId ? agentsById.get(agentId) : undefined;
      setLeads((current) =>
        current.map((lead) =>
          leadIds.includes(lead.id)
            ? { ...lead, assignedToId: agent?.id ?? null, assignedTo: agent ? { id: agent.id, name: agent.name } : null }
            : lead,
        ),
      );
      const subject = leadIds.length === 1 ? "Lead" : `${leadIds.length} leads`;
      toast.success(agent ? `${subject} assigned to ${agent.name}` : `${subject} moved to the unassigned queue`, { description: sessionOnly });
    },
    [agentsById],
  );

  const onStatusChange = useCallback((leadIds: string[], status: LeadStatus) => {
    setLeads((current) => current.map((lead) => (leadIds.includes(lead.id) ? { ...lead, status } : lead)));
    const subject = leadIds.length === 1 ? "Lead" : `${leadIds.length} leads`;
    toast.success(`${subject} moved to ${LEAD_STATUS_LABELS[status]}`, { description: sessionOnly });
  }, []);

  const onCreate = (values: LeadFormValues) => {
    const agent = values.assignedToId ? agentsById.get(values.assignedToId) : undefined;
    const draft: LeadListItem = {
      id: `draft_${Date.now().toString(36)}`,
      agencyId: leads[0]?.agencyId ?? "",
      contactId: "",
      name: values.name,
      phoneMasked: maskPhone(values.phone),
      status: "new",
      priority: values.priority,
      sourceId: values.sourceId,
      sourceLabel: data.sources.find((source) => source.id === values.sourceId)?.label ?? "Other",
      intent: values.intent,
      interest: values.interest,
      location: values.location,
      budgetMinPKR: values.budgetMin,
      budgetMaxPKR: values.budgetMax,
      assignedToId: agent?.id ?? null,
      assignedTo: agent ? { id: agent.id, name: agent.name } : null,
      createdAt: data.now,
      lastActivityAt: data.now,
      isDraft: true,
    };
    setLeads((current) => [draft, ...current]);
    setFilters(emptyLeadFilters);
    toast.success(`${values.name} added as a draft lead`, { description: sessionOnly });
  };

  const emptyState = hasActiveFilters(filters) ? (
    <EmptyState
      icon={SearchX}
      title="No leads match these filters"
      description="Try a different search or clear some filters."
      action={<Button variant="outline" onClick={() => updateFilters(emptyLeadFilters)}>Clear filters</Button>}
      className="border-t"
    />
  ) : (
    <EmptyState
      icon={UsersRound}
      title="No leads yet"
      description="Leads from Zameen.com, Graana, ads, and WhatsApp will appear here once connected. You can also add one manually."
      action={<Button onClick={() => setAddOpen(true)}><Plus />Add lead</Button>}
      className="border-t"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Sales<DemoBadge /></span>}
        title="Leads"
        description="Capture, qualify, and route every inquiry to the right agent."
        actions={
          <>
            <Button variant="outline" onClick={() => notifyDemoAction("Export leads", "CSV export arrives with the Reports module.")}>
              <Download />
              Export
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus />
              Add lead
            </Button>
          </>
        }
      />

      <LeadsStats summary={summary} />

      <section aria-label="Leads list" className="flex min-w-0 flex-col rounded-xl border bg-card pt-4 shadow-card">
        <LeadsToolbar leads={leads} filters={filters} onChange={updateFilters} sources={data.sources} agents={data.agents} />
        <LeadsTable
          leads={filtered}
          now={data.now}
          agents={data.agents}
          rowSelection={rowSelection}
          onRowSelectionChange={onRowSelectionChange}
          onAssign={onAssign}
          onStatusChange={onStatusChange}
          emptyState={emptyState}
        />
      </section>

      <BulkActionsBar
        count={selectedIds.length}
        agents={data.agents}
        onAssign={(agentId) => {
          onAssign(selectedIds, agentId);
          setRowSelection({});
        }}
        onStatusChange={(status) => {
          onStatusChange(selectedIds, status);
          setRowSelection({});
        }}
        onClear={() => setRowSelection({})}
      />

      <AddLeadSheet open={addOpen} onOpenChange={setAddOpen} agents={data.agents} sources={data.sources} onCreate={onCreate} />
    </div>
  );
}
