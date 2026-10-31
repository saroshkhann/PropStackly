import { DEMO_NOW } from "@/config/app";
import type { Property } from "@/domain/property";
import { getLeadPeeks } from "@/features/leads/data/lead-peeks";
import { createMemberResolver, getAssignableAgents } from "@/features/workspace/members";
import { demoProperties } from "@/mocks/properties";
import { demoSiteVisits } from "@/mocks/site-visits";
import type { SiteVisitsPageData, VisitPropertyRef } from "./types";

function toPropertyRef(p: Property): VisitPropertyRef {
  return { id: p.id, title: p.title, location: p.location, address: p.address, cover: p.images[0] };
}

/** Site visit read model, scoped by `agencyId`. */
export async function getSiteVisitsPageData(agencyId: string): Promise<SiteVisitsPageData> {
  const resolveMember = createMemberResolver(agencyId);
  const leads = getLeadPeeks(agencyId);
  const leadById = new Map(leads.map((l) => [l.id, l]));
  const properties = demoProperties.filter((p) => p.agencyId === agencyId);
  const propertyById = new Map(properties.map((p) => [p.id, p]));

  return {
    now: DEMO_NOW,
    visits: demoSiteVisits
      .filter((v) => v.agencyId === agencyId)
      .map((v) => {
        const property = v.propertyId ? propertyById.get(v.propertyId) : undefined;
        return {
          ...v,
          agent: resolveMember(v.assignedToId),
          lead: v.leadId ? (leadById.get(v.leadId) ?? null) : null,
          property: property ? toPropertyRef(property) : null,
        };
      }),
    agents: getAssignableAgents(agencyId),
    leads: leads.filter((l) => l.status !== "lost" && l.status !== "won"),
    properties: properties.filter((p) => p.status === "available" || p.status === "under_offer").map(toPropertyRef),
  };
}
