import { DEMO_NOW } from "@/config/app";
import { PROPERTY_STATUS_LABELS, type Property } from "@/domain/property";
import { createMemberResolver, getAssignableAgents } from "@/features/workspace/members";
import { formatPKRCompact } from "@/lib/format";
import { demoContacts } from "@/mocks/contacts";
import { leadSources } from "@/mocks/lead-sources";
import { demoProperties } from "@/mocks/properties";
import { demoPropertyInquiries } from "@/mocks/property-inquiries";
import type { ListingEvent, OwnerRef, PropertiesPageData, PropertyDetailData, PropertyFormOptions, PropertyListItem } from "./types";

/*
 * Property read models, scoped by `agencyId`. With Prisma, owners and inquiries must be joined through
 * agency-scoped relations so a listing can never reference another tenant's contact.
 */

function agencyOwners(agencyId: string): OwnerRef[] {
  return demoContacts
    .filter((c) => c.agencyId === agencyId && (c.types.includes("seller") || c.types.includes("landlord")))
    .map((c) => ({ id: c.id, name: c.name, phoneMasked: c.phoneMasked }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function formOptions(agencyId: string): PropertyFormOptions {
  return {
    agents: getAssignableAgents(agencyId),
    owners: agencyOwners(agencyId),
    locations: [...new Set(demoProperties.filter((p) => p.agencyId === agencyId).map((p) => p.location))].sort(),
  };
}

function toListItem(property: Property, owners: Map<string, OwnerRef>, resolveMember: ReturnType<typeof createMemberResolver>): PropertyListItem {
  const inquiries = demoPropertyInquiries.filter((i) => i.agencyId === property.agencyId && i.propertyId === property.id);
  return {
    ...property,
    owner: property.ownerContactId ? (owners.get(property.ownerContactId) ?? null) : null,
    agent: resolveMember(property.assignedAgentId),
    inquiryCount: inquiries.length,
    openInquiryCount: inquiries.filter((i) => i.status === "new").length,
    lastInquiryAt: inquiries[0]?.createdAt ?? null,
  };
}

export async function getPropertiesPageData(agencyId: string): Promise<PropertiesPageData> {
  const options = formOptions(agencyId);
  const owners = new Map(options.owners.map((owner) => [owner.id, owner]));
  const resolveMember = createMemberResolver(agencyId);
  return {
    now: DEMO_NOW,
    ...options,
    properties: demoProperties
      .filter((p) => p.agencyId === agencyId)
      .sort((a, b) => b.listedAt.localeCompare(a.listedAt))
      .map((p) => toListItem(p, owners, resolveMember)),
  };
}

export function getPropertyIds(agencyId: string) {
  return demoProperties.filter((p) => p.agencyId === agencyId).map((p) => p.id);
}

function listingHistory(property: Property): ListingEvent[] {
  const events: ListingEvent[] = [
    { id: "listed", title: "Listed", detail: `Asking ${formatPKRCompact(property.pricePKR)}${property.purpose === "rent" ? " per month" : ""}`, at: property.listedAt },
  ];
  if (property.status !== "available") {
    events.push({ id: "status", title: `Marked ${PROPERTY_STATUS_LABELS[property.status].toLowerCase()}`, detail: null, at: property.updatedAt });
  } else if (property.updatedAt !== property.listedAt) {
    events.push({ id: "refresh", title: "Listing refreshed on portals", detail: "Zameen.com and Graana", at: property.updatedAt });
  }
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

export async function getPropertyDetail(agencyId: string, propertyId: string): Promise<PropertyDetailData | null> {
  const property = demoProperties.find((p) => p.id === propertyId && p.agencyId === agencyId);
  if (!property) return null;
  const options = formOptions(agencyId);
  const owners = new Map(options.owners.map((owner) => [owner.id, owner]));
  const owner = demoContacts.find((c) => c.id === property.ownerContactId && c.agencyId === agencyId) ?? null;

  return {
    now: DEMO_NOW,
    ...options,
    property: toListItem(property, owners, createMemberResolver(agencyId)),
    owner,
    inquiries: demoPropertyInquiries
      .filter((i) => i.agencyId === agencyId && i.propertyId === property.id)
      .map((i) => ({ ...i, sourceLabel: leadSources.find((s) => s.id === i.sourceId)?.label ?? "Other" })),
    history: listingHistory(property),
  };
}

export async function getPropertyFormOptions(agencyId: string) {
  return { now: DEMO_NOW, ...formOptions(agencyId) };
}
