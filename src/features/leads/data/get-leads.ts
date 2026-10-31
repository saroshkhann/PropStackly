import { DEMO_NOW } from "@/config/app";
import type { Lead } from "@/domain/lead";
import { createMemberResolver, getAssignableAgents } from "@/features/workspace/members";
import { demoActivities } from "@/mocks/activities";
import { demoContacts } from "@/mocks/contacts";
import { leadSources } from "@/mocks/lead-sources";
import { demoLeads } from "@/mocks/leads";
import { demoProperties, interestedPropertyIds } from "@/mocks/properties";
import { demoSchedule } from "@/mocks/schedule";
import type { ActivityEntry, LeadDetailData, LeadListItem, LeadsPageData } from "./types";

/*
 * Lead read models. Every query is scoped by `agencyId`; the Prisma implementation must keep that filter
 * in the database query itself, after the server has verified the user's membership in the agency.
 */

function toListItem(lead: Lead, resolveMember: ReturnType<typeof createMemberResolver>): LeadListItem {
  return {
    ...lead,
    assignedTo: resolveMember(lead.assignedToId),
    sourceLabel: leadSources.find((source) => source.id === lead.sourceId)?.label ?? "Other",
  };
}

export async function getLeadsPageData(agencyId: string): Promise<LeadsPageData> {
  const resolveMember = createMemberResolver(agencyId);
  return {
    now: DEMO_NOW,
    leads: demoLeads
      .filter((lead) => lead.agencyId === agencyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((lead) => toListItem(lead, resolveMember)),
    agents: getAssignableAgents(agencyId),
    sources: leadSources,
  };
}

export function getLeadIds(agencyId: string) {
  return demoLeads.filter((lead) => lead.agencyId === agencyId).map((lead) => lead.id);
}

export function toActivityEntries(agencyId: string, filter: (activity: (typeof demoActivities)[number]) => boolean): ActivityEntry[] {
  const resolveMember = createMemberResolver(agencyId);
  return demoActivities
    .filter((activity) => activity.agencyId === agencyId && filter(activity))
    .map((activity) => ({ ...activity, actorName: resolveMember(activity.actorId)?.name ?? null }));
}

export async function getLeadDetail(agencyId: string, leadId: string): Promise<LeadDetailData | null> {
  const lead = demoLeads.find((l) => l.id === leadId && l.agencyId === agencyId);
  if (!lead) return null;
  const contact = demoContacts.find((c) => c.id === lead.contactId && c.agencyId === agencyId);
  if (!contact) return null;

  const resolveMember = createMemberResolver(agencyId);
  const propertyIds = new Set(interestedPropertyIds(lead.id, lead.status === "new" ? 1 : 3));

  return {
    now: DEMO_NOW,
    lead: toListItem(lead, resolveMember),
    contact,
    activities: toActivityEntries(agencyId, (activity) => activity.leadId === lead.id),
    followUps: demoSchedule
      .filter((item) => item.agencyId === agencyId && item.leadId === lead.id)
      .map((item) => ({ ...item, assignedTo: resolveMember(item.assignedToId) })),
    properties: demoProperties.filter((p) => p.agencyId === agencyId && propertyIds.has(p.id)),
    agents: getAssignableAgents(agencyId),
    sources: leadSources,
  };
}
