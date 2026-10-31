"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, CircleCheckBig, ClipboardList, Handshake, List, SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FacetFilter } from "@/components/shared/facet-filter";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { VISIT_OUTCOME_LABELS, VISIT_STATUSES, VISIT_STATUS_LABELS, type VisitOutcome, type VisitStatus } from "@/domain/site-visit";
import { SegmentedControl } from "@/features/properties/components/segmented-control";
import { dayKey, formatDate, formatNumber, formatPercent } from "@/lib/format";
import type { SiteVisitsPageData, VisitItem } from "../data/types";
import type { VisitFormValues } from "../lib/visit-schema";
import { emptyVisitFilters, filterVisits, isUpcoming, needsOutcome, summarizeVisits, type VisitFilters } from "../lib/visits";
import { VisitDetailsSheet } from "./visit-details-sheet";
import { VisitFormDialog } from "./visit-form-dialog";
import { VisitRow } from "./visit-row";
import { VisitsCalendar } from "./visits-calendar";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

export function SiteVisitsView({ data }: { data: SiteVisitsPageData }) {
  const { now, agents, leads, properties } = data;
  const today = dayKey(now);
  const [visits, setVisits] = useState<VisitItem[]>(data.visits);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filters, setFilters] = useState<VisitFilters>(emptyVisitFilters);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; visit: VisitItem | null }>({ open: false, visit: null });

  const filtered = useMemo(() => filterVisits(visits, filters), [visits, filters]);
  const summary = useMemo(() => summarizeVisits(visits, now), [visits, now]);
  const selected = visits.find((v) => v.id === selectedId) ?? null;
  const dayVisits = filtered.filter((v) => dayKey(v.startsAt) === selectedDay).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const set = <K extends keyof VisitFilters>(key: K, value: VisitFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const active = Boolean(filters.query || filters.statuses.length || filters.agents.length);

  const update = (visit: VisitItem, changes: Partial<VisitItem>, message: string) => {
    setVisits((current) => current.map((v) => (v.id === visit.id ? { ...v, ...changes, hasLocalEdits: v.isDraft ? undefined : true } : v)));
    toast.success(message, { description: sessionOnly });
  };

  const setStatus = (visit: VisitItem, status: VisitStatus) => {
    update(visit, { status }, `Visit marked ${VISIT_STATUS_LABELS[status].toLowerCase()}`);
    if (status === "cancelled" || status === "no_show") setSelectedId(null);
  };

  const logOutcome = (visit: VisitItem, outcome: VisitOutcome, notes: string) =>
    update(visit, { status: "completed", outcome, notes: notes || null }, `Outcome logged: ${VISIT_OUTCOME_LABELS[outcome]}`);

  const save = (values: VisitFormValues) => {
    const lead = leads.find((l) => l.id === values.leadId) ?? null;
    const property = properties.find((p) => p.id === values.propertyId) ?? null;
    const agent = agents.find((a) => a.id === values.assignedToId);
    const startsAt = new Date(`${values.date}T${values.time}:00+05:00`).toISOString();
    const fields: Partial<VisitItem> = {
      title: property ? `${property.title} viewing` : "Property viewing",
      leadId: lead?.id ?? null,
      lead,
      customerName: lead?.name ?? "Customer",
      customerPhoneMasked: lead?.phoneMasked ?? "",
      propertyId: property?.id ?? null,
      property,
      meetingPoint: values.meetingPoint,
      startsAt,
      durationMinutes: Number(values.durationMinutes),
      assignedToId: values.assignedToId,
      agent: agent ? { id: agent.id, name: agent.name } : null,
      priority: values.priority,
      notes: values.notes || null,
    };
    if (form.visit) {
      update(form.visit, fields, "Visit rescheduled");
    } else {
      const draft = {
        id: `draft_${crypto.randomUUID().slice(0, 8)}`,
        agencyId: visits[0]?.agencyId ?? "",
        status: "scheduled",
        outcome: null,
        isDraft: true,
        ...fields,
      } as VisitItem;
      setVisits((current) => [...current, draft]);
      toast.success("Site visit scheduled", { description: sessionOnly });
    }
    setSelectedDay(values.date);
    setMonth(values.date.slice(0, 7));
  };

  const upcoming = filtered.filter((v) => isUpcoming(v, now)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const attention = filtered.filter((v) => needsOutcome(v, now));
  const past = filtered.filter((v) => !isUpcoming(v, now) && !needsOutcome(v, now)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Sales<DemoBadge /></span>}
        title="Site visits"
        description="Schedule property viewings and record how each one went."
        actions={
          <Button onClick={() => setForm({ open: true, visit: null })}>
            <CalendarPlus />
            Schedule visit
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Today" icon={CalendarDays} value={formatNumber(summary.today)} hint="Visits on the calendar" />
        <StatCard label="Next 7 days" icon={ClipboardList} value={formatNumber(summary.thisWeek)} hint="Scheduled or confirmed" />
        <StatCard label="Completed" icon={CircleCheckBig} value={formatNumber(summary.completedThisMonth)} hint={`This month · ${formatPercent(summary.positiveRate)} positive`} />
        <StatCard
          label="Offers from visits"
          icon={Handshake}
          value={formatNumber(summary.offers)}
          hint={summary.needsOutcome ? `${summary.needsOutcome} ${summary.needsOutcome === 1 ? "visit needs" : "visits need"} an outcome` : "Every visit has an outcome"}
          tone={summary.needsOutcome ? "attention" : "default"}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SegmentedControl
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "calendar", label: <><CalendarDays className="size-4" aria-hidden />Calendar</> },
            { value: "list", label: <><List className="size-4" aria-hidden />List</> },
          ]}
        />
        <SearchInput value={filters.query} onChange={(query) => set("query", query)} placeholder="Search customers, properties, areas…" label="Search site visits" className="lg:w-72" />
        <div className="flex flex-wrap items-center gap-2">
          <FacetFilter title="Status" selected={filters.statuses} onChange={(v) => set("statuses", v)} options={VISIT_STATUSES.map((s) => ({ value: s, label: VISIT_STATUS_LABELS[s], count: visits.filter((v) => v.status === s).length }))} />
          <FacetFilter title="Agent" searchable selected={filters.agents} onChange={(v) => set("agents", v)} options={agents.map((a) => ({ value: a.id, label: a.name, count: visits.filter((v) => v.assignedToId === a.id).length }))} />
          {active && (
            <Button variant="ghost" onClick={() => setFilters(emptyVisitFilters)}>
              Reset
              <X />
            </Button>
          )}
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <section aria-label="Calendar" className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-card">
            <VisitsCalendar
              visits={filtered}
              month={month}
              onMonth={setMonth}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              today={today}
              onOpen={(visit) => setSelectedId(visit.id)}
            />
          </section>
          <section aria-label="Selected day" className="flex flex-col rounded-xl border bg-card shadow-card">
            <header className="flex items-center justify-between gap-2 border-b px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold">{selectedDay === today ? "Today" : formatDate(`${selectedDay}T12:00:00+05:00`, "weekday")}</h2>
                <p className="text-xs text-muted-foreground">{dayVisits.length} {dayVisits.length === 1 ? "visit" : "visits"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setForm({ open: true, visit: null })}>
                <CalendarPlus />
                Add
              </Button>
            </header>
            {dayVisits.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No visits this day" description="Pick another day or schedule a viewing." />
            ) : (
              <ul className="divide-y">
                {dayVisits.map((visit) => (
                  <VisitRow key={visit.id} visit={visit} now={now} onOpen={(v) => setSelectedId(v.id)} showDate={false} />
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-card">
          <EmptyState
            icon={SearchX}
            title={active ? "No visits match" : "No site visits yet"}
            description={active ? "Try different filters." : "Schedule a viewing to see it here."}
            action={active ? <Button variant="outline" onClick={() => setFilters(emptyVisitFilters)}>Clear filters</Button> : undefined}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {[
            { id: "attention", label: "Needs an outcome", items: attention, tone: "text-warning" },
            { id: "upcoming", label: "Upcoming", items: upcoming, tone: "text-muted-foreground" },
            { id: "past", label: "Past visits", items: past, tone: "text-muted-foreground" },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.id} aria-label={group.label} className="overflow-hidden rounded-xl border bg-card shadow-card">
                <h2 className={`border-b px-5 py-2.5 text-xs font-semibold tracking-[0.02em] ${group.tone}`}>
                  {group.label} <span className="font-medium tabular">{group.items.length}</span>
                </h2>
                <ul className="divide-y">
                  {group.items.map((visit) => (
                    <VisitRow key={visit.id} visit={visit} now={now} onOpen={(v) => setSelectedId(v.id)} />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      <VisitDetailsSheet
        visit={selected}
        now={now}
        onClose={() => setSelectedId(null)}
        onStatus={setStatus}
        onOutcome={logOutcome}
        onEdit={(visit) => setForm({ open: true, visit })}
      />
      <VisitFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
        visit={form.visit}
        defaultDate={selectedDay >= today ? selectedDay : undefined}
        agents={agents}
        leads={leads}
        properties={properties}
        now={now}
        onSubmit={save}
      />
    </div>
  );
}
