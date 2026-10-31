import type { Deal, PipelineStage, PipelineStageId } from "@/domain/deal";
import { DEMO_NOW } from "@/config/app";
import { dayKey } from "@/lib/format";
import { demoClosedSales } from "./activity";
import { DEMO_AGENCY_ID, demoMembers } from "./agency";
import { createRandom, hoursFromNow } from "./utils";

export const pipelineStages: PipelineStage[] = [
  { id: "inquiry", label: "Inquiry", order: 1 },
  { id: "qualified", label: "Qualified", order: 2 },
  { id: "site_visit", label: "Site visit", order: 3 },
  { id: "negotiation", label: "Negotiation", order: 4 },
  { id: "token", label: "Token (Bayana)", order: 5 },
  { id: "closed_won", label: "Closed won", order: 6 },
];

const openStageVolume: Record<Exclude<PipelineStageId, "closed_won">, number> = {
  inquiry: 26,
  qualified: 18,
  site_visit: 13,
  negotiation: 8,
  token: 5,
};

const random = createRandom(4401);
const owners = demoMembers.filter((m) => m.role !== "owner");

const openDeals: Deal[] = pipelineStages.flatMap((stage) =>
  Array.from({ length: stage.id === "closed_won" ? 0 : openStageVolume[stage.id] }, (_, index): Deal => ({
    id: `dl_${stage.id}_${index}`,
    agencyId: DEMO_AGENCY_ID,
    title: `Deal ${stage.order}-${index + 1}`,
    leadId: `led_${900 + index}`,
    propertyId: null,
    stageId: stage.id,
    valuePKR: Math.round((14_000_000 + random.next() * 70_000_000) / 500_000) * 500_000,
    ownerId: random.pick(owners).id,
    updatedAt: hoursFromNow(-random.int(1, 24 * 20)),
  })),
);

/** Sales closed this month, taken from the same history that feeds the analytics charts. */
const currentMonth = dayKey(DEMO_NOW).slice(0, 7);
const closedThisMonth: Deal[] = demoClosedSales
  .filter((sale) => dayKey(sale.closedAt).startsWith(currentMonth))
  .map((sale, index) => ({
    id: `dl_closed_${index}`,
    agencyId: DEMO_AGENCY_ID,
    title: `Closed sale ${index + 1}`,
    leadId: `led_${800 + index}`,
    propertyId: null,
    stageId: "closed_won",
    valuePKR: sale.valuePKR,
    ownerId: random.pick(owners).id,
    updatedAt: sale.closedAt,
  }));

export const demoDeals: Deal[] = [...openDeals, ...closedThisMonth];
