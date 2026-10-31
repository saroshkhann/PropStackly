import { DEMO_NOW } from "@/config/app";
import { LOST_REASONS, type Deal, type PipelineStage, type PipelineStageId } from "@/domain/deal";
import type { LeadStatus } from "@/domain/lead";
import { dayKey } from "@/lib/format";
import { demoClosedSales } from "./activity";
import { DEMO_AGENCY_ID, demoMembers } from "./agency";
import { demoLeads } from "./leads";
import { demoProperties, matchingPropertyIds } from "./properties";
import { createRandom, hoursFromNow } from "./utils";

export const pipelineStages: PipelineStage[] = [
  { id: "inquiry", label: "Inquiry", order: 1, probability: 0.1, outcome: "open" },
  { id: "qualified", label: "Qualified", order: 2, probability: 0.25, outcome: "open" },
  { id: "site_visit", label: "Site visit", order: 3, probability: 0.4, outcome: "open" },
  { id: "negotiation", label: "Negotiation", order: 4, probability: 0.6, outcome: "open" },
  { id: "token", label: "Token (Bayana)", order: 5, probability: 0.85, outcome: "open" },
  { id: "closed_won", label: "Closed won", order: 6, probability: 1, outcome: "won" },
  { id: "closed_lost", label: "Closed lost", order: 7, probability: 0, outcome: "lost" },
];

const random = createRandom(4401);
const agents = demoMembers.filter((m) => m.role !== "owner").map((m) => m.id);
const propertyById = new Map(demoProperties.map((p) => [p.id, p]));
const openListings = demoProperties.filter((p) => p.status === "available" || p.status === "under_offer");
const closedListings = demoProperties.filter((p) => p.status === "sold" || p.status === "rented");

const stageForLead: Partial<Record<LeadStatus, PipelineStageId>> = {
  contacted: "inquiry",
  qualified: "qualified",
  site_visit: "site_visit",
  negotiation: "negotiation",
  won: "closed_won",
  lost: "closed_lost",
};

function base(fields: Partial<Deal> & Pick<Deal, "id" | "title" | "customerName" | "stageId" | "valuePKR" | "ownerId" | "createdAt" | "updatedAt" | "purpose">): Deal {
  return {
    agencyId: DEMO_AGENCY_ID,
    leadId: null,
    contactId: null,
    propertyId: null,
    probability: null,
    expectedCloseAt: null,
    closedAt: null,
    lostReason: null,
    notes: null,
    ...fields,
  };
}

const leadDeals: Deal[] = demoLeads
  .filter((lead) => stageForLead[lead.status] && lead.assignedToId)
  .map((lead) => {
    const stageId = stageForLead[lead.status]!;
    const propertyId = matchingPropertyIds(lead)[0] ?? null;
    const closed = stageId === "closed_won" || stageId === "closed_lost";
    const monthly = (lead.budgetMinPKR + lead.budgetMaxPKR) / 2;
    return base({
      id: `dl_${lead.id.replace("led_", "")}`,
      title: `${lead.interest} · ${lead.location.split(",")[0]}`,
      purpose: lead.intent === "rent" ? "rent" : "sale",
      customerName: lead.name,
      leadId: lead.id,
      contactId: lead.contactId,
      propertyId,
      stageId,
      valuePKR: Math.round((lead.intent === "rent" ? monthly * 12 : monthly) / 100_000) * 100_000,
      ownerId: lead.assignedToId!,
      expectedCloseAt: closed ? null : hoursFromNow(24 * random.int(7, 60)),
      closedAt: closed ? lead.lastActivityAt : null,
      lostReason: stageId === "closed_lost" ? random.pick(LOST_REASONS) : null,
      notes: stageId === "negotiation" ? "Client has made an initial offer; owner reviewing." : null,
      createdAt: lead.createdAt,
      updatedAt: lead.lastActivityAt,
    });
  });

const prospectNames = [
  "Usman Ghani", "Saba Tariq", "Hamid Raza", "Areeba Khan", "Zeeshan Haider", "Mariam Iqbal", "Ali Hassan Shah",
  "Javeria Aslam", "Shoaib Anwar", "Rida Fatima", "Kamran Yousaf", "Sana Mirza", "Waleed Ahmed", "Hafsa Noor",
  "Bilal Saeed", "Mahira Javed", "Taimoor Ali", "Nimra Shah", "Fawad Hussain", "Aiman Qureshi",
];
const stageWeights: PipelineStageId[] = ["inquiry", "inquiry", "inquiry", "qualified", "qualified", "site_visit", "site_visit", "negotiation", "token", "closed_lost"];

const prospectDeals: Deal[] = prospectNames.map((name, index) => {
  const property = openListings[(index * 5 + 3) % openListings.length]!;
  const stageId = random.pick(stageWeights);
  const created = random.int(24 * 3, 24 * 70);
  const updated = random.int(2, Math.min(created, 24 * 14));
  const value = property.purpose === "rent" ? property.pricePKR * 12 : property.pricePKR * (0.92 + random.next() * 0.06);
  return base({
    id: `dl_p${(index + 1).toString().padStart(2, "0")}`,
    title: `${property.title} · ${property.location}`,
    purpose: property.purpose,
    customerName: name,
    propertyId: property.id,
    stageId,
    valuePKR: Math.round(value / 100_000) * 100_000,
    ownerId: property.assignedAgentId ?? random.pick(agents),
    expectedCloseAt: stageId === "closed_lost" ? null : hoursFromNow(24 * random.int(5, 75)),
    closedAt: stageId === "closed_lost" ? hoursFromNow(-updated) : null,
    lostReason: stageId === "closed_lost" ? random.pick(LOST_REASONS) : null,
    createdAt: hoursFromNow(-created),
    updatedAt: hoursFromNow(-updated),
  });
});

/** Sales closed this month, taken from the same history that feeds the analytics charts. */
const currentMonth = dayKey(DEMO_NOW).slice(0, 7);
const closedThisMonth: Deal[] = demoClosedSales
  .filter((sale) => dayKey(sale.closedAt).startsWith(currentMonth))
  .map((sale, index) => {
    const property = closedListings[index % Math.max(1, closedListings.length)];
    const name = prospectNames[(index * 7 + 2) % prospectNames.length]!;
    return base({
      id: `dl_closed_${index}`,
      title: property ? `${property.title} · ${property.location}` : "Property sale",
      purpose: "sale",
      customerName: name,
      propertyId: property?.id ?? null,
      stageId: "closed_won",
      valuePKR: sale.valuePKR,
      ownerId: (property && propertyById.get(property.id)?.assignedAgentId) ?? random.pick(agents),
      closedAt: sale.closedAt,
      createdAt: hoursFromNow(-24 * random.int(30, 90)),
      updatedAt: sale.closedAt,
    });
  });

export const demoDeals: Deal[] = [...leadDeals, ...prospectDeals, ...closedThisMonth];
