"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, MapPin, MapPinned, Pencil, Share2, UserRoundCog } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentChip } from "@/components/shared/agent-chip";
import { AgentPicker } from "@/components/shared/agent-picker";
import { ContactActions } from "@/components/shared/contact-actions";
import { DemoBadge } from "@/components/shared/demo-badge";
import { DetailList } from "@/components/shared/detail-list";
import { PropertyStatusBadge } from "@/components/shared/property-row";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AREA_UNITS, AREA_UNIT_LABELS, formatArea, pricePerMarla } from "@/domain/area";
import {
  LISTING_PURPOSE_LABELS,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_META,
  statusesFor,
  type AreaUnit,
  type PropertyStatus,
} from "@/domain/property";
import { notifyDemoAction } from "@/lib/demo";
import { formatDate, formatPKR, formatPKRCompact, formatRelative } from "@/lib/format";
import type { ListingEvent, PropertyDetailData, PropertyListItem } from "../data/types";
import { daysOnMarket } from "../lib/property-metrics";
import { InquiryList } from "./inquiry-list";
import { PropertyGallery } from "./property-gallery";
import { usePropertySession } from "./property-session";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

export function PropertyDetailView({ data }: { data: PropertyDetailData }) {
  const { now, owner, inquiries, history, agents } = data;
  const session = usePropertySession();
  const property = session.resolve(data.property);
  const [unit, setUnit] = useState<AreaUnit>(property.area.unit);
  const [extraEvents, setExtraEvents] = useState<ListingEvent[]>([]);

  const meta = PROPERTY_TYPE_META[property.type];
  const perMarla = pricePerMarla(property.pricePKR, property.area);
  const events = useMemo(() => [...extraEvents, ...history], [extraEvents, history]);

  const update = (changes: Partial<PropertyListItem>, eventTitle: string) => {
    session.save({ ...property, ...changes, updatedAt: now, hasLocalEdits: true });
    setExtraEvents((current) => [{ id: `local_${current.length}`, title: eventTitle, detail: null, at: now }, ...current]);
    toast.success(eventTitle, { description: sessionOnly });
  };

  const changeStatus = (status: PropertyStatus) => {
    if (status !== property.status) update({ status }, `Marked ${PROPERTY_STATUS_LABELS[status].toLowerCase()}`);
  };

  const assign = (agentId: string | null) => {
    const agent = agents.find((a) => a.id === agentId);
    update({ assignedAgentId: agent?.id ?? null, agent: agent ? { id: agent.id, name: agent.name } : null }, agent ? `Assigned to ${agent.name}` : "Agent unassigned");
  };

  const facts = [
    { label: "Type", value: meta.label },
    { label: "Purpose", value: LISTING_PURPOSE_LABELS[property.purpose] },
    { label: "Category", value: PROPERTY_CATEGORY_LABELS[property.category] },
    { label: "Area", value: formatArea(property.area, unit) },
    ...(property.bedrooms !== null ? [{ label: "Bedrooms", value: String(property.bedrooms) }] : []),
    ...(property.bathrooms !== null ? [{ label: "Bathrooms", value: String(property.bathrooms) }] : []),
    { label: property.purpose === "rent" ? "Rent per Marla" : "Price per Marla", value: formatPKRCompact(perMarla) },
    { label: "Listing ID", value: `#${property.id.replace("prp_", "")}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/properties">Properties</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[16rem] truncate">{property.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <PropertyStatusBadge status={property.status} />
              <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{LISTING_PURPOSE_LABELS[property.purpose]}</span>
              <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{meta.label}</span>
              {property.hasLocalEdits ? (
                <span className="rounded-full border border-dashed border-warning/40 px-2 py-0.5 text-[11px] font-medium text-warning">Unsaved edits</span>
              ) : (
                <DemoBadge />
              )}
            </div>
            <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] sm:text-2xl">{property.title}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {property.address}, {property.location}, {property.city}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => notifyDemoAction("Share listing", "Sharing to WhatsApp and portals arrives with integrations.")}>
              <Share2 />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Listing status</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={property.status} onValueChange={(value) => changeStatus(value as PropertyStatus)}>
                  {statusesFor(property.purpose).map((status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {PROPERTY_STATUS_LABELS[status]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href={`/properties/${property.id}/edit`}>
                <Pencil />
                Edit listing
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <PropertyGallery images={property.images} title={property.title} />

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inquiries">
                Inquiries <span className="text-muted-foreground tabular">{inquiries.length}</span>
              </TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-4">
              <SectionCard
                title="Key facts"
                action={
                  <Select value={unit} onValueChange={(value) => setUnit(value as AreaUnit)}>
                    <SelectTrigger size="sm" aria-label="Area unit" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      {AREA_UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {AREA_UNIT_LABELS[u].long}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              >
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
                  {facts.map((fact) => (
                    <div key={fact.label} className="bg-card px-3.5 py-3">
                      <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-foreground tabular">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>

              <SectionCard title="Description">
                <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-secondary-foreground">{property.description}</p>
              </SectionCard>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: "Features", items: property.features },
                  { title: "Amenities", items: property.amenities },
                ].map((group) => (
                  <SectionCard key={group.title} title={group.title}>
                    {group.items.length ? (
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-[13px] text-secondary-foreground">
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                              <Check className="size-3" aria-hidden />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-muted-foreground">None listed.</p>
                    )}
                  </SectionCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inquiries">
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <InquiryList inquiries={inquiries} now={now} />
              </div>
            </TabsContent>

            <TabsContent value="location">
              <SectionCard title="Address">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailList
                    items={[
                      { label: "City", value: property.city },
                      { label: "Society / area", value: property.location },
                      { label: "Phase / block / sector", value: property.sector },
                      { label: "Address", value: property.address },
                    ]}
                  />
                  <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 p-4 text-center">
                    <MapPinned className="size-6 text-subtle-foreground" aria-hidden />
                    <p className="text-[13px] font-medium">Map preview not connected</p>
                    <p className="max-w-xs text-xs text-muted-foreground">Pinning listings on a map will be added with a maps integration.</p>
                  </div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="history">
              <SectionCard title="Listing history">
                <ol className="flex flex-col gap-3">
                  {events.map((event) => (
                    <li key={event.id} className="flex items-start gap-3">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium">
                          {event.title}
                          {event.id.startsWith("local_") && (
                            <span className="ml-2 rounded-full border border-dashed border-warning/40 px-1.5 py-px text-[10.5px] font-medium text-warning">Not saved</span>
                          )}
                        </p>
                        {event.detail && <p className="text-xs text-muted-foreground">{event.detail}</p>}
                      </div>
                      <time dateTime={event.at} className="text-xs text-subtle-foreground tabular">
                        {formatDate(event.at, "dayMonth")}
                      </time>
                    </li>
                  ))}
                </ol>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>

        <aside aria-label="Listing summary" className="flex flex-col gap-4">
          <section aria-label="Price" className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-xs text-muted-foreground">{property.purpose === "rent" ? "Monthly rent" : "Asking price"}</p>
            <p className="mt-1 text-[28px] leading-none font-semibold tracking-[-0.025em] tabular">
              <span className="mr-1.5 text-sm font-medium tracking-normal text-muted-foreground">PKR</span>
              {formatPKRCompact(property.pricePKR, { prefix: false })}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground tabular">{formatPKR(property.pricePKR)}</p>
            <div className="mt-4 border-t pt-4">
              <DetailList
                items={[
                  { label: "Status", value: <PropertyStatusBadge status={property.status} className="h-5 px-2 text-[11px]" /> },
                  { label: "Days on market", value: `${daysOnMarket(property.listedAt, now)} days` },
                  { label: "Listed", value: formatDate(property.listedAt, "dayMonth") },
                  { label: "Last updated", value: formatRelative(property.updatedAt, now) },
                ]}
              />
            </div>
          </section>

          <SectionCard
            title="Owner"
            action={
              owner && (
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href={`/contacts/${owner.id}`}>
                    Profile
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              )
            }
          >
            {owner ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={owner.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{owner.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {owner.occupation ?? "Owner"} · {owner.area}
                    </p>
                  </div>
                </div>
                <DetailList
                  items={[
                    { label: "Phone", value: <span className="tabular">{owner.phoneMasked}</span> },
                    { label: "Email", value: owner.email ?? <span className="text-muted-foreground">Not provided</span> },
                  ]}
                />
                <ContactActions phoneMasked={owner.phoneMasked} hasWhatsApp={owner.hasWhatsApp} email={owner.email} size="sm" />
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">No owner linked. Edit the listing to link one from your contacts.</p>
            )}
          </SectionCard>

          <SectionCard title="Assigned agent" description="Handles viewings and owner updates.">
            <div className="flex items-center justify-between gap-3">
              <AgentChip name={property.agent?.name ?? null} />
              <AgentPicker agents={agents} value={property.assignedAgentId} onChange={assign} align="end">
                <Button variant="outline" size="sm">
                  <UserRoundCog />
                  {property.assignedAgentId ? "Reassign" : "Assign"}
                </Button>
              </AgentPicker>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
