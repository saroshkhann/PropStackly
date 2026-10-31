import { DEMO_NOW } from "@/config/app";
import type { Property } from "@/domain/property";
import { createMemberResolver, getAssignableAgents } from "@/features/workspace/members";
import { demoDeals, pipelineStages } from "@/mocks/deals";
import { demoLeads } from "@/mocks/leads";
import { demoProperties } from "@/mocks/properties";
import type { DealPropertyRef, PipelinePageData } from "./types";

function toPropertyRef(property: Property): DealPropertyRef {
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    pricePKR: property.pricePKR,
    purpose: property.purpose,
    cover: property.images[0],
  };
}

/** Pipeline read model, scoped by `agencyId` like every other module. */
export async function getPipelinePageData(agencyId: string): Promise<PipelinePageData> {
  const resolveMember = createMemberResolver(agencyId);
  const properties = demoProperties.filter((p) => p.agencyId === agencyId);
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const leads = demoLeads.filter((l) => l.agencyId === agencyId);
  const leadById = new Map(leads.map((l) => [l.id, l]));

  return {
    now: DEMO_NOW,
    stages: pipelineStages,
    deals: demoDeals
      .filter((deal) => deal.agencyId === agencyId)
      .map((deal) => {
        const property = deal.propertyId ? propertyById.get(deal.propertyId) : undefined;
        return {
          ...deal,
          owner: resolveMember(deal.ownerId),
          property: property ? toPropertyRef(property) : null,
          customerPhoneMasked: deal.leadId ? (leadById.get(deal.leadId)?.phoneMasked ?? null) : null,
        };
      }),
    agents: getAssignableAgents(agencyId),
    leads: leads
      .filter((l) => l.status !== "lost")
      .map((l) => ({ id: l.id, name: l.name, contactId: l.contactId, interest: l.interest, phoneMasked: l.phoneMasked }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    properties: properties.filter((p) => p.status === "available" || p.status === "under_offer").map(toPropertyRef),
  };
}
