"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Ellipsis, Handshake, UserRoundCog, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { AgentChip } from "@/components/shared/agent-chip";
import { ContactActions } from "@/components/shared/contact-actions";
import { DemoBadge } from "@/components/shared/demo-badge";
import { DetailList } from "@/components/shared/detail-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyRow } from "@/components/shared/property-row";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { ActivityKind } from "@/domain/activity";
import { CONTACT_TYPE_LABELS } from "@/domain/contact";
import { LEAD_INTENT_LABELS, LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";
import { notifyDemoAction } from "@/lib/demo";
import { formatDate, formatRelative } from "@/lib/format";
import type { ActivityEntry, FollowUpEntry, LeadDetailData, LeadListItem } from "../data/types";
import { karachiDateTimeToIso, type FollowUpValues, type NoteValues } from "../lib/detail-schemas";
import { AddFollowUpDialog } from "./add-follow-up-dialog";
import { AgentPicker } from "@/components/shared/agent-picker";
import { FollowUpsPanel } from "./follow-ups-panel";
import { LeadPriorityBadge, LeadStatusBadge } from "./lead-badges";
import { formatBudget } from "../lib/format-budget";
import { LeadStatusStepper } from "./lead-status-stepper";
import { NoteComposer } from "./note-composer";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

const noteTitles: Record<NoteValues["kind"], string> = {
  note: "Note added",
  call: "Call logged",
  whatsapp: "WhatsApp conversation logged",
  email: "Email logged",
};

export function LeadDetailView({ data, currentUserName }: { data: LeadDetailData; currentUserName: string }) {
  const { now, contact, agents, properties } = data;
  const [lead, setLead] = useState<LeadListItem>(data.lead);
  const [activities, setActivities] = useState<ActivityEntry[]>(data.activities);
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>(data.followUps);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [tab, setTab] = useState("activity");
  const [composer, setComposer] = useState<{ key: number; kind: NoteValues["kind"] }>({ key: 0, kind: "note" });

  const openFollowUps = useMemo(() => followUps.filter((item) => !item.completedAt).length, [followUps]);
  const actorName = currentUserName;

  const log = (kind: ActivityKind, title: string, body: string | null = null) => {
    setActivities((current) => [
      {
        id: `draft_act_${current.length}_${kind}`,
        agencyId: lead.agencyId,
        kind,
        leadId: lead.id,
        contactId: lead.contactId,
        actorId: null,
        actorName,
        title,
        body,
        createdAt: now,
        isDraft: true,
      },
      ...current,
    ]);
  };

  const changeStatus = (status: LeadStatus) => {
    if (status === lead.status) return;
    setLead((current) => ({ ...current, status, lastActivityAt: now }));
    log("status_change", `Status changed to ${LEAD_STATUS_LABELS[status]}`);
    toast.success(`Moved to ${LEAD_STATUS_LABELS[status]}`, { description: sessionOnly });
  };

  const assign = (agentId: string | null) => {
    const agent = agents.find((a) => a.id === agentId);
    setLead((current) => ({ ...current, assignedToId: agent?.id ?? null, assignedTo: agent ? { id: agent.id, name: agent.name } : null }));
    log("assignment", agent ? `Assigned to ${agent.name}` : "Moved to the unassigned queue");
    toast.success(agent ? `Assigned to ${agent.name}` : "Moved to the unassigned queue", { description: sessionOnly });
  };

  const addNote = (values: NoteValues) => {
    log(values.kind, noteTitles[values.kind], values.body);
    toast.success(noteTitles[values.kind], { description: sessionOnly });
  };

  const addFollowUp = (values: FollowUpValues) => {
    const agent = agents.find((a) => a.id === values.assignedToId);
    const startsAt = karachiDateTimeToIso(values.date, values.time);
    setFollowUps((current) => [
      ...current,
      {
        id: `draft_fu_${current.length}`,
        agencyId: lead.agencyId,
        kind: values.kind,
        leadId: lead.id,
        title: values.title,
        leadName: lead.name,
        location: values.kind === "site_visit" ? values.location : null,
        channel: values.kind === "follow_up" ? values.channel : null,
        startsAt,
        assignedToId: values.assignedToId,
        assignedTo: agent ? { id: agent.id, name: agent.name } : null,
        priority: values.priority,
        completedAt: null,
        isDraft: true,
      },
    ]);
    log("follow_up", `${values.kind === "site_visit" ? "Site visit" : "Follow-up"} scheduled`, `${values.title} · ${formatDate(startsAt, "weekday")}, ${formatDate(startsAt, "time")}`);
    setTab("follow-ups");
    toast.success("Follow-up scheduled", { description: sessionOnly });
  };

  const toggleFollowUp = (id: string) => {
    setFollowUps((current) => current.map((item) => (item.id === id ? { ...item, completedAt: item.completedAt ? null : now } : item)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/leads">Leads</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lead.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar name={lead.name} size="lg" className="size-12 text-base" />
            <div className="min-w-0">
              <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] sm:text-2xl">{lead.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground">
                <LeadStatusBadge status={lead.status} />
                <LeadPriorityBadge priority={lead.priority} />
                <span>via {lead.sourceLabel}</span>
                <span>Created {formatRelative(lead.createdAt, now)}</span>
                <DemoBadge />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ContactActions
              phoneMasked={contact.phoneMasked}
              hasWhatsApp={contact.hasWhatsApp}
              email={contact.email}
              onLog={(channel) => {
                setTab("activity");
                setComposer((current) => ({ key: current.key + 1, kind: channel }));
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More lead actions">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={() => notifyDemoAction("Convert to deal", "The Pipeline module arrives in a later batch.")}>
                  <Handshake aria-hidden /> Convert to deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => changeStatus("lost")}>
                  <XCircle aria-hidden /> Mark as lost
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-xl border bg-card px-4 pt-3 pb-2 shadow-card">
          <LeadStatusStepper status={lead.status} onChange={changeStatus} />
          {lead.status === "lost" && (
            <p className="mt-1 px-1 text-xs text-danger">This lead is marked as lost. Choose a stage above to reopen it.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section aria-label="Lead workspace" className="min-w-0 xl:col-span-2">
          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="follow-ups">
                Follow-ups
                {openFollowUps > 0 && <span className="text-muted-foreground tabular">{openFollowUps}</span>}
              </TabsTrigger>
              <TabsTrigger value="properties">
                Properties <span className="text-muted-foreground tabular">{properties.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="flex flex-col gap-5">
              <NoteComposer key={composer.key} defaultKind={composer.kind} autoFocus={composer.key > 0} onSubmit={addNote} idPrefix={lead.id} />
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <ActivityTimeline entries={activities} now={now} />
              </div>
            </TabsContent>

            <TabsContent value="follow-ups">
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <FollowUpsPanel items={followUps} now={now} onAdd={() => setFollowUpOpen(true)} onToggleComplete={toggleFollowUp} />
              </div>
            </TabsContent>

            <TabsContent value="properties">
              <div className="rounded-xl border bg-card p-5 shadow-card">
                {properties.length === 0 ? (
                  <EmptyState icon={Handshake} title="No properties shared yet" description="Listings you share with this client will appear here." />
                ) : (
                  <>
                    <p className="mb-3 text-[13px] text-muted-foreground">Listings shared with or shortlisted by {lead.name.split(" ")[0]}.</p>
                    <div className="divide-y">
                      {properties.map((property, index) => (
                        <PropertyRow key={property.id} property={property} note={index === 0 && lead.status !== "new" ? "Visited" : "Shared"} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <aside aria-label="Lead details" className="flex flex-col gap-4">
          <SectionCard
            title="Customer"
            action={
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href={`/contacts/${contact.id}`}>
                  Profile
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            }
          >
            <DetailList
              items={[
                { label: "Phone", value: <span className="tabular">{contact.phoneMasked}</span> },
                { label: "WhatsApp", value: contact.hasWhatsApp ? "Same number" : "Not on WhatsApp" },
                { label: "Email", value: contact.email ?? <span className="text-muted-foreground">Not provided</span> },
                { label: "Lives in", value: `${contact.area}, ${contact.city}` },
                { label: "Occupation", value: contact.occupation ?? "—" },
                { label: "Contact type", value: contact.types.map((type) => CONTACT_TYPE_LABELS[type]).join(", ") },
              ]}
            />
          </SectionCard>

          <SectionCard title="Requirement">
            <DetailList
              items={[
                { label: "Intent", value: LEAD_INTENT_LABELS[lead.intent] },
                { label: "Looking for", value: lead.interest },
                { label: "Preferred area", value: lead.location },
                { label: "Budget (PKR)", value: <span className="tabular">{formatBudget(lead)}</span> },
              ]}
            />
          </SectionCard>

          <SectionCard title="Ownership" description="Who is responsible for converting this lead.">
            <div className="flex items-center justify-between gap-3">
              <AgentChip name={lead.assignedTo?.name ?? null} />
              <AgentPicker agents={agents} value={lead.assignedToId} onChange={assign} align="end">
                <Button variant="outline" size="sm">
                  <UserRoundCog />
                  {lead.assignedToId ? "Reassign" : "Assign"}
                </Button>
              </AgentPicker>
            </div>
            <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              Last activity {formatRelative(lead.lastActivityAt, now)} · Lead #{lead.id.replace("led_", "")}
            </p>
          </SectionCard>
        </aside>
      </div>

      <AddFollowUpDialog
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        agents={agents}
        defaultAgentId={lead.assignedToId}
        now={now}
        onCreate={addFollowUp}
      />
    </div>
  );
}
