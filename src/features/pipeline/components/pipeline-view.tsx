"use client";

import { useMemo, useState } from "react";
import { Handshake, Plus, Scale, Target, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/shared/demo-badge";
import { FacetFilter } from "@/components/shared/facet-filter";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import type { PipelineStageId } from "@/domain/deal";
import { SegmentedControl } from "@/features/properties/components/segmented-control";
import { formatNumber, formatPercent, formatPKRCompact } from "@/lib/format";
import type { DealItem, PipelinePageData } from "../data/types";
import type { DealFormValues } from "../lib/deal-schema";
import { defaultBoardSettings, emptyDealFilters, filterDeals, moveDeal, summarizeBoard, type BoardSettings, type DealFilters } from "../lib/pipeline";
import { BoardCustomizer } from "./board-customizer";
import { DealDetailsSheet } from "./deal-details-sheet";
import { DealFormDialog } from "./deal-form-dialog";
import { KanbanBoard } from "./kanban-board";
import { LostReasonDialog } from "./lost-reason-dialog";
import { MobileStageList } from "./mobile-stage-list";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

export function PipelineView({ data }: { data: PipelinePageData }) {
  const { stages, now, agents } = data;
  const [deals, setDeals] = useState<DealItem[]>(data.deals);
  const [filters, setFilters] = useState<DealFilters>(emptyDealFilters);
  const [settings, setSettings] = useState<BoardSettings>(defaultBoardSettings);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lostDialog, setLostDialog] = useState<{ open: boolean; deal: DealItem | null }>({ open: false, deal: null });
  const [form, setForm] = useState<{ open: boolean; deal: DealItem | null }>({ open: false, deal: null });
  const [announcement, setAnnouncement] = useState("");

  const visible = useMemo(() => filterDeals(deals, filters), [deals, filters]);
  const summary = useMemo(() => summarizeBoard(deals, stages, now), [deals, stages, now]);
  const selected = deals.find((d) => d.id === selectedId) ?? null;
  const stageLabel = (id: PipelineStageId) => stages.find((s) => s.id === id)?.label ?? id;

  const replace = (next: DealItem) => setDeals((current) => current.map((d) => (d.id === next.id ? next : d)));

  const move = (deal: DealItem, stageId: PipelineStageId) => {
    if (stageId === deal.stageId) return;
    if (stageId === "closed_lost") {
      setLostDialog({ open: true, deal });
      return;
    }
    replace(moveDeal(deal, stageId, now));
    const message = `${deal.title} moved to ${stageLabel(stageId)}`;
    setAnnouncement(message);
    toast.success(stageId === "closed_won" ? `Deal won · ${formatPKRCompact(deal.valuePKR)}` : message, { description: sessionOnly });
  };

  const confirmLost = (reason: string) => {
    const deal = lostDialog.deal;
    if (!deal) return;
    replace(moveDeal(deal, "closed_lost", now, reason));
    setAnnouncement(`${deal.title} marked as lost`);
    toast("Deal marked as lost", { description: sessionOnly });
    setLostDialog({ open: false, deal });
  };

  const assign = (deal: DealItem, agentId: string | null) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    replace({ ...deal, ownerId: agent.id, owner: { id: agent.id, name: agent.name }, updatedAt: now, hasLocalEdits: true });
    toast.success(`Assigned to ${agent.name}`, { description: sessionOnly });
  };

  const save = (values: DealFormValues) => {
    const agent = agents.find((a) => a.id === values.ownerId);
    const property = data.properties.find((p) => p.id === values.propertyId) ?? null;
    const lead = data.leads.find((l) => l.id === values.leadId);
    const existing = form.deal;
    const closing = values.stageId === "closed_won" || values.stageId === "closed_lost";
    const next: DealItem = {
      ...(existing ?? {
        id: `draft_${crypto.randomUUID().slice(0, 8)}`,
        agencyId: deals[0]?.agencyId ?? "",
        createdAt: now,
        isDraft: true,
      }),
      title: values.title,
      purpose: values.purpose,
      customerName: values.customerName,
      leadId: lead?.id ?? null,
      contactId: lead?.contactId ?? null,
      customerPhoneMasked: lead?.phoneMasked ?? null,
      propertyId: property?.id ?? null,
      property,
      stageId: values.stageId,
      valuePKR: values.value,
      probability: closing ? null : values.probability,
      ownerId: values.ownerId,
      owner: agent ? { id: agent.id, name: agent.name } : null,
      expectedCloseAt: values.expectedClose ? new Date(`${values.expectedClose}T12:00:00+05:00`).toISOString() : null,
      closedAt: closing ? (existing?.closedAt ?? now) : null,
      lostReason: values.stageId === "closed_lost" ? values.lostReason : null,
      notes: values.notes || null,
      updatedAt: now,
      hasLocalEdits: existing ? true : undefined,
    };
    setDeals((current) => (existing ? current.map((d) => (d.id === next.id ? next : d)) : [next, ...current]));
    toast.success(existing ? "Deal updated" : `Deal created in ${stageLabel(values.stageId)}`, { description: sessionOnly });
  };

  const filtersActive = filters.query || filters.agents.length || filters.purpose !== "all";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Sales<DemoBadge /></span>}
        title="Pipeline"
        description="Move deals from first inquiry to bayana and transfer. Drag cards between stages or use a card’s menu."
        actions={
          <Button onClick={() => setForm({ open: true, deal: null })}>
            <Plus />
            New deal
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Open deals" icon={Handshake} value={formatNumber(summary.openCount)} hint={`${formatPKRCompact(summary.openValue)} in play`} />
        <StatCard label="Weighted forecast" icon={Scale} value={formatPKRCompact(summary.weighted)} hint="Value × stage probability" />
        <StatCard label="Won this month" icon={Trophy} value={formatPKRCompact(summary.wonValue)} hint={`${summary.wonCount} deals closed`} />
        <StatCard label="Win rate" icon={Target} value={formatPercent(summary.winRate)} hint={`${summary.lostCount} lost this month`} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={filters.query}
          onChange={(query) => setFilters((f) => ({ ...f, query }))}
          placeholder="Search deals, customers, properties…"
          label="Search deals"
          className="lg:w-80"
        />
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="Deal type"
            value={filters.purpose}
            onChange={(purpose) => setFilters((f) => ({ ...f, purpose }))}
            options={[
              { value: "all", label: "All" },
              { value: "sale", label: "Sales" },
              { value: "rent", label: "Rentals" },
            ]}
          />
          <FacetFilter
            title="Agent"
            searchable
            selected={filters.agents}
            onChange={(selectedAgents) => setFilters((f) => ({ ...f, agents: selectedAgents }))}
            options={agents.map((agent) => ({ value: agent.id, label: agent.name, count: deals.filter((d) => d.ownerId === agent.id).length }))}
          />
          {filtersActive ? (
            <Button variant="ghost" onClick={() => setFilters(emptyDealFilters)}>
              Reset
              <X />
            </Button>
          ) : null}
        </div>
        <div className="lg:ml-auto">
          <BoardCustomizer stages={stages} settings={settings} onChange={setSettings} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="max-md:hidden">
        <KanbanBoard stages={stages} deals={visible} settings={settings} now={now} onOpen={(deal) => setSelectedId(deal.id)} onMove={move} />
      </div>
      <div className="md:hidden">
        <MobileStageList stages={stages} deals={visible} settings={settings} now={now} onOpen={(deal) => setSelectedId(deal.id)} onMove={move} />
      </div>

      <DealDetailsSheet
        deal={selected}
        stages={stages}
        agents={agents}
        now={now}
        onClose={() => setSelectedId(null)}
        onMove={move}
        onAssign={assign}
        onEdit={(deal) => setForm({ open: true, deal })}
      />
      <DealFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
        deal={form.deal}
        stages={stages}
        agents={agents}
        leads={data.leads}
        properties={data.properties}
        now={now}
        onSubmit={save}
      />
      <LostReasonDialog
        open={lostDialog.open}
        dealTitle={lostDialog.deal?.title ?? ""}
        onCancel={() => setLostDialog((current) => ({ ...current, open: false }))}
        onConfirm={confirmLost}
      />
    </div>
  );
}
