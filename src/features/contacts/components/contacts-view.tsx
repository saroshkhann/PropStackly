"use client";

import { useCallback, useMemo, useState } from "react";
import { BookUser, Building, Clock3, Plus, SearchX, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DemoBadge } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FacetFilter } from "@/components/shared/facet-filter";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { CONTACT_TYPES, CONTACT_TYPE_LABELS, type ContactType } from "@/domain/contact";
import { formatNumber } from "@/lib/format";
import type { ContactListItem, ContactsPageData } from "../data/types";
import { emptyContactFilters, filterContacts, hasActiveContactFilters, type ContactFilters } from "../lib/contact-filters";
import { summarizeContacts } from "../lib/contact-metrics";
import { applyContactForm } from "../lib/apply-contact-form";
import type { ContactFormValues } from "../lib/contact-schema";
import { ContactFormSheet } from "./contact-form-sheet";
import { ContactsTable } from "./contacts-table";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

export function ContactsView({ data }: { data: ContactsPageData }) {
  const [contacts, setContacts] = useState<ContactListItem[]>(data.contacts);
  const [filters, setFilters] = useState<ContactFilters>(emptyContactFilters);
  const [sheet, setSheet] = useState<{ open: boolean; contact?: ContactListItem }>({ open: false });

  const filtered = useMemo(() => filterContacts(contacts, filters), [contacts, filters]);
  const summary = useMemo(() => summarizeContacts(contacts, data.now), [contacts, data.now]);
  const tagOptions = useMemo(() => [...new Set([...data.tags, ...contacts.flatMap((c) => c.tags)])].sort(), [data.tags, contacts]);

  const typeCounts = useMemo(() => {
    const counts = new Map<ContactType, number>();
    for (const contact of contacts) for (const type of contact.types) counts.set(type, (counts.get(type) ?? 0) + 1);
    return counts;
  }, [contacts]);

  const onEdit = useCallback((contact: ContactListItem) => setSheet({ open: true, contact }), []);

  const onSubmit = (values: ContactFormValues) => {
    if (sheet.contact) {
      const id = sheet.contact.id;
      setContacts((current) => current.map((c) => (c.id === id ? applyContactForm(c, values, data.agents) : c)));
      toast.success(`${values.name} updated`, { description: sessionOnly });
      return;
    }
    const base: ContactListItem = {
      id: `draft_${Date.now().toString(36)}`,
      agencyId: contacts[0]?.agencyId ?? "",
      name: "",
      types: [],
      phoneMasked: "",
      hasWhatsApp: false,
      email: null,
      city: "Lahore",
      area: "",
      occupation: null,
      tags: [],
      ownerId: "",
      owner: null,
      notes: null,
      createdAt: data.now,
      lastContactedAt: null,
      leadCount: 0,
      openLeadCount: 0,
      propertyCount: 0,
      isDraft: true,
    };
    setContacts((current) => [applyContactForm(base, values, data.agents), ...current]);
    setFilters(emptyContactFilters);
    toast.success(`${values.name} added to contacts`, { description: sessionOnly });
  };

  const set = <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));

  const emptyState = hasActiveContactFilters(filters) ? (
    <EmptyState
      icon={SearchX}
      title="No contacts match"
      description="Try another search term or clear the filters."
      action={<Button variant="outline" onClick={() => setFilters(emptyContactFilters)}>Clear filters</Button>}
      className="border-t"
    />
  ) : (
    <EmptyState
      icon={BookUser}
      title="Your directory is empty"
      description="Add buyers, sellers, landlords, and tenants to keep every relationship in one place."
      action={<Button onClick={() => setSheet({ open: true })}><UserPlus />Add contact</Button>}
      className="border-t"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Sales<DemoBadge /></span>}
        title="Contacts"
        description="Every buyer, seller, landlord, tenant, and investor your agency works with."
        actions={
          <Button onClick={() => setSheet({ open: true })}>
            <Plus />
            Add contact
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total contacts" icon={Users} value={formatNumber(summary.total)} hint={`${summary.addedThisMonth} added in the last 30 days`} />
        <StatCard label="Buyers & tenants" icon={UserPlus} value={formatNumber(summary.buyers)} hint="Including investors" />
        <StatCard label="Owners" icon={Building} value={formatNumber(summary.owners)} hint={`${summary.listings} listings under mandate`} />
        <StatCard
          label="Going cold"
          icon={Clock3}
          value={formatNumber(summary.goingCold)}
          hint="No contact in 14+ days"
          tone={summary.goingCold > 0 ? "attention" : "default"}
        />
      </div>

      <section aria-label="Contacts directory" className="flex min-w-0 flex-col rounded-xl border bg-card pt-4 shadow-card">
        <div className="flex flex-col gap-3 px-5 pb-4">
          <Tabs value={filters.type} onValueChange={(value) => set("type", value as ContactFilters["type"])}>
            <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-1">
              <TabsList>
                <TabsTrigger value="all">
                  All <span className="text-muted-foreground tabular">{contacts.length}</span>
                </TabsTrigger>
                {CONTACT_TYPES.map((type) => (
                  <TabsTrigger key={type} value={type}>
                    {CONTACT_TYPE_LABELS[type]}s <span className="text-muted-foreground tabular">{typeCounts.get(type) ?? 0}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchInput
              value={filters.query}
              onChange={(query) => set("query", query)}
              placeholder="Search name, phone, area, tag…"
              label="Search contacts"
              className="lg:w-72"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FacetFilter
                title="Managed by"
                searchable
                selected={filters.owners}
                onChange={(value) => set("owners", value)}
                options={data.agents.map((agent) => ({
                  value: agent.id,
                  label: agent.name,
                  count: contacts.filter((c) => c.ownerId === agent.id).length,
                }))}
              />
              <FacetFilter
                title="Tags"
                searchable
                selected={filters.tags}
                onChange={(value) => set("tags", value)}
                options={tagOptions.map((tag) => ({ value: tag, label: tag, count: contacts.filter((c) => c.tags.includes(tag)).length }))}
              />
              {hasActiveContactFilters(filters) && (
                <Button variant="ghost" onClick={() => setFilters(emptyContactFilters)}>
                  Reset
                  <X />
                </Button>
              )}
            </div>
          </div>
        </div>
        <ContactsTable contacts={filtered} now={data.now} onEdit={onEdit} emptyState={emptyState} />
      </section>

      <ContactFormSheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((current) => ({ ...current, open }))}
        agents={data.agents}
        contact={sheet.contact}
        onSubmit={onSubmit}
      />
    </div>
  );
}
