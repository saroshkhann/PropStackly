import { DEMO_NOW } from "@/config/app";
import { OPEN_LEAD_STATUSES, type Lead } from "@/domain/lead";
import type { Contact } from "@/domain/contact";
import { getLeadsPageData, toActivityEntries } from "@/features/leads/data/get-leads";
import { createMemberResolver, getAssignableAgents } from "@/features/workspace/members";
import { demoContacts } from "@/mocks/contacts";
import { demoLeads } from "@/mocks/leads";
import { demoProperties, interestedPropertyIds } from "@/mocks/properties";
import type { ContactDetailData, ContactListItem, ContactsPageData } from "./types";

/* Contact read models, scoped by `agencyId` exactly like the lead queries. */

function toListItem(contact: Contact, leads: Lead[], resolveMember: ReturnType<typeof createMemberResolver>): ContactListItem {
  const contactLeads = leads.filter((lead) => lead.contactId === contact.id);
  return {
    ...contact,
    owner: resolveMember(contact.ownerId),
    leadCount: contactLeads.length,
    openLeadCount: contactLeads.filter((lead) => OPEN_LEAD_STATUSES.includes(lead.status)).length,
    propertyCount: demoProperties.filter((p) => p.agencyId === contact.agencyId && p.ownerContactId === contact.id).length,
  };
}

function agencyTags(contacts: Contact[]) {
  return [...new Set(contacts.flatMap((contact) => contact.tags))].sort((a, b) => a.localeCompare(b));
}

export async function getContactsPageData(agencyId: string): Promise<ContactsPageData> {
  const resolveMember = createMemberResolver(agencyId);
  const contacts = demoContacts.filter((c) => c.agencyId === agencyId);
  const leads = demoLeads.filter((l) => l.agencyId === agencyId);
  return {
    now: DEMO_NOW,
    contacts: contacts
      .map((contact) => toListItem(contact, leads, resolveMember))
      .sort((a, b) => (b.lastContactedAt ?? b.createdAt).localeCompare(a.lastContactedAt ?? a.createdAt)),
    agents: getAssignableAgents(agencyId),
    tags: agencyTags(contacts),
  };
}

export function getContactIds(agencyId: string) {
  return demoContacts.filter((c) => c.agencyId === agencyId).map((c) => c.id);
}

export async function getContactDetail(agencyId: string, contactId: string): Promise<ContactDetailData | null> {
  const contact = demoContacts.find((c) => c.id === contactId && c.agencyId === agencyId);
  if (!contact) return null;

  const resolveMember = createMemberResolver(agencyId);
  const leads = demoLeads.filter((l) => l.agencyId === agencyId);
  const { leads: leadItems } = await getLeadsPageData(agencyId);
  const contactLeads = leadItems.filter((lead) => lead.contactId === contact.id);
  const interestedIds = new Set(contactLeads.flatMap((lead) => interestedPropertyIds(lead.id, lead.status === "new" ? 1 : 3)));

  return {
    now: DEMO_NOW,
    contact: toListItem(contact, leads, resolveMember),
    leads: contactLeads,
    ownedProperties: demoProperties.filter((p) => p.agencyId === agencyId && p.ownerContactId === contact.id),
    interestedProperties: demoProperties.filter((p) => p.agencyId === agencyId && interestedIds.has(p.id)),
    activities: toActivityEntries(agencyId, (activity) => activity.contactId === contact.id),
    agents: getAssignableAgents(agencyId),
    tags: agencyTags(demoContacts.filter((c) => c.agencyId === agencyId)),
  };
}
