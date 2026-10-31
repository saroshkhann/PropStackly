"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Inbox, Pencil, Tag } from "lucide-react";
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
import { LEAD_INTENT_LABELS } from "@/domain/lead";
import { LeadStatusBadge } from "@/features/leads/components/lead-badges";
import { formatBudget } from "@/features/leads/lib/format-budget";
import { NoteComposer } from "@/features/leads/components/note-composer";
import type { ActivityEntry } from "@/features/leads/data/types";
import type { NoteValues } from "@/features/leads/lib/detail-schemas";
import { formatDate, formatRelative } from "@/lib/format";
import type { ContactDetailData, ContactListItem } from "../data/types";
import type { ContactFormValues } from "../lib/contact-schema";
import { ContactFormSheet } from "./contact-form-sheet";
import { ContactTypeBadges } from "./contact-type-badges";
import { applyContactForm } from "../lib/apply-contact-form";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

const noteTitles: Record<NoteValues["kind"], string> = {
  note: "Note added",
  call: "Call logged",
  whatsapp: "WhatsApp conversation logged",
  email: "Email logged",
};

export function ContactProfileView({ data, currentUserName }: { data: ContactDetailData; currentUserName: string }) {
  const { now, leads, ownedProperties, interestedProperties, agents } = data;
  const [contact, setContact] = useState<ContactListItem>(data.contact);
  const [activities, setActivities] = useState<ActivityEntry[]>(data.activities);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState("activity");
  const [composer, setComposer] = useState<{ key: number; kind: NoteValues["kind"] }>({ key: 0, kind: "note" });

  const log = (kind: ActivityKind, title: string, body: string | null) => {
    setActivities((current) => [
      {
        id: `draft_act_${current.length}`,
        agencyId: contact.agencyId,
        kind,
        leadId: null,
        contactId: contact.id,
        actorId: null,
        actorName: currentUserName,
        title,
        body,
        createdAt: now,
        isDraft: true,
      },
      ...current,
    ]);
  };

  const onEdit = (values: ContactFormValues) => {
    setContact((current) => ({ ...applyContactForm(current, values, agents), isDraft: true }));
    log("note", "Contact details updated", null);
    toast.success("Contact updated", { description: sessionOnly });
  };

  const leadNames = new Map(leads.map((lead) => [lead.id, lead.interest]));
  const timeline = activities.map((activity) => ({
    ...activity,
    context: activity.leadId && leadNames.has(activity.leadId) ? (
      <Link href={`/leads/${activity.leadId}`} className="underline-offset-4 hover:text-foreground hover:underline">
        {leadNames.get(activity.leadId)}
      </Link>
    ) : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/contacts">Contacts</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{contact.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar name={contact.name} size="lg" className="size-12 text-base" />
            <div className="min-w-0">
              <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] sm:text-2xl">{contact.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted-foreground">
                <ContactTypeBadges types={contact.types} />
                <span>
                  {contact.area}, {contact.city}
                </span>
                <span>Client since {formatDate(contact.createdAt, "dayMonth")}</span>
                {contact.isDraft ? (
                  <span className="rounded-full border border-dashed border-warning/40 px-2 py-px text-[11px] font-medium text-warning">Unsaved edits</span>
                ) : (
                  <DemoBadge />
                )}
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
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section aria-label="Contact workspace" className="min-w-0 xl:col-span-2">
          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="leads">
                Leads <span className="text-muted-foreground tabular">{leads.length}</span>
              </TabsTrigger>
              <TabsTrigger value="properties">
                Properties <span className="text-muted-foreground tabular">{ownedProperties.length + interestedProperties.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="flex flex-col gap-5">
              <NoteComposer
                key={composer.key}
                defaultKind={composer.kind}
                autoFocus={composer.key > 0}
                idPrefix={contact.id}
                onSubmit={(values) => {
                  log(values.kind, noteTitles[values.kind], values.body);
                  toast.success(noteTitles[values.kind], { description: sessionOnly });
                }}
              />
              <div className="rounded-xl border bg-card p-5 shadow-card">
                {timeline.length ? (
                  <ActivityTimeline entries={timeline} now={now} />
                ) : (
                  <EmptyState icon={Inbox} title="No activity yet" description="Calls, messages, and notes with this contact will appear here." />
                )}
              </div>
            </TabsContent>

            <TabsContent value="leads">
              <div className="rounded-xl border bg-card shadow-card">
                {leads.length === 0 ? (
                  <EmptyState icon={Inbox} title="No leads for this contact" description="Inquiries they make will be linked here automatically." />
                ) : (
                  <ul className="divide-y">
                    {leads.map((lead) => (
                      <li key={lead.id}>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">
                              {LEAD_INTENT_LABELS[lead.intent]} · {lead.interest}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {lead.location} · <span className="tabular">PKR {formatBudget(lead)}</span> · via {lead.sourceLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <LeadStatusBadge status={lead.status} />
                            <AgentChip name={lead.assignedTo?.name ?? null} short className="text-xs" />
                            <span className="w-16 text-right text-xs text-muted-foreground tabular">{formatRelative(lead.lastActivityAt, now)}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            <TabsContent value="properties" className="flex flex-col gap-4">
              <SectionCard title="Owned & listed" description="Properties this contact has listed with your agency.">
                {ownedProperties.length ? (
                  <div className="divide-y">
                    {ownedProperties.map((property) => (
                      <PropertyRow key={property.id} property={property} note="Owner" />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">No listings under this contact.</p>
                )}
              </SectionCard>
              <SectionCard title="Shown interest in" description="Listings shared with or shortlisted through their leads.">
                {interestedProperties.length ? (
                  <div className="divide-y">
                    {interestedProperties.map((property) => (
                      <PropertyRow key={property.id} property={property} note="Shared" />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">Nothing shared yet.</p>
                )}
              </SectionCard>
            </TabsContent>
          </Tabs>
        </section>

        <aside aria-label="Contact details" className="flex flex-col gap-4">
          <SectionCard title="Details">
            <DetailList
              items={[
                { label: "Phone", value: <span className="tabular">{contact.phoneMasked}</span> },
                { label: "WhatsApp", value: contact.hasWhatsApp ? "Same number" : "Not on WhatsApp" },
                { label: "Email", value: contact.email ?? <span className="text-muted-foreground">Not provided</span> },
                { label: "Occupation", value: contact.occupation ?? "—" },
                { label: "Last contacted", value: contact.lastContactedAt ? formatRelative(contact.lastContactedAt, now) : "Never" },
                { label: "Managed by", value: <AgentChip name={contact.owner?.name ?? null} className="justify-end" /> },
              ]}
            />
          </SectionCard>

          <SectionCard title="Relationship">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Leads", value: leads.length },
                { label: "Open", value: leads.filter((l) => !["won", "lost"].includes(l.status)).length },
                { label: "Listings", value: ownedProperties.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-muted/50 px-2 py-3">
                  <p className="text-lg font-semibold tabular">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Tags & notes">
            {contact.tags.length > 0 ? (
              <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag) => (
                  <li key={tag} className="flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-secondary-foreground">
                    <Tag className="size-3 text-subtle-foreground" aria-hidden />
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-muted-foreground">No tags yet.</p>
            )}
            <p className="mt-3 border-t pt-3 text-[13px] leading-relaxed text-secondary-foreground">
              {contact.notes ?? <span className="text-muted-foreground">No notes. Use Edit to add preferences or key details.</span>}
            </p>
          </SectionCard>

          {ownedProperties.length > 0 && (
            <Button asChild variant="outline" className="justify-between">
              <Link href="/properties">
                <span className="flex items-center gap-2">
                  <Building2 />
                  View in property inventory
                </span>
                <ArrowUpRight />
              </Link>
            </Button>
          )}
        </aside>
      </div>

      <ContactFormSheet open={editOpen} onOpenChange={setEditOpen} agents={agents} contact={contact} onSubmit={onEdit} />
    </div>
  );
}
