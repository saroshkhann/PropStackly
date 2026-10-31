import { isOpenStage, type PipelineStage, type PipelineStageId } from "@/domain/deal";
import type { ListingPurpose } from "@/domain/property";
import { dayKey } from "@/lib/format";
import type { DealItem } from "../data/types";

export type DealSort = "updated" | "value" | "close_date";

export interface BoardSettings {
  hiddenStages: PipelineStageId[];
  density: "comfortable" | "compact";
  fields: { customer: boolean; property: boolean; agent: boolean; closeDate: boolean };
  sort: DealSort;
}

export const defaultBoardSettings: BoardSettings = {
  hiddenStages: [],
  density: "comfortable",
  fields: { customer: true, property: true, agent: true, closeDate: true },
  sort: "updated",
};

export interface DealFilters {
  query: string;
  agents: string[];
  purpose: ListingPurpose | "all";
}

export const emptyDealFilters: DealFilters = { query: "", agents: [], purpose: "all" };

export function dealProbability(deal: Pick<DealItem, "probability" | "stageId">, stages: PipelineStage[]) {
  return deal.probability ?? stages.find((s) => s.id === deal.stageId)?.probability ?? 0;
}

export function filterDeals(deals: DealItem[], filters: DealFilters) {
  const query = filters.query.toLowerCase().trim();
  return deals.filter((deal) => {
    if (query && ![deal.title, deal.customerName, deal.property?.title ?? "", deal.property?.location ?? "", deal.owner?.name ?? ""].join(" ").toLowerCase().includes(query)) {
      return false;
    }
    if (filters.agents.length && !filters.agents.includes(deal.ownerId)) return false;
    if (filters.purpose !== "all" && deal.purpose !== filters.purpose) return false;
    return true;
  });
}

export function sortDeals(deals: DealItem[], sort: DealSort) {
  const sorted = [...deals];
  if (sort === "value") return sorted.sort((a, b) => b.valuePKR - a.valuePKR);
  if (sort === "close_date") return sorted.sort((a, b) => (a.expectedCloseAt ?? "9").localeCompare(b.expectedCloseAt ?? "9"));
  return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function summarizeBoard(deals: DealItem[], stages: PipelineStage[], now: string) {
  const open = deals.filter((d) => isOpenStage(d.stageId));
  const month = dayKey(now).slice(0, 7);
  const closedThisMonth = deals.filter((d) => d.closedAt !== null && dayKey(d.closedAt).startsWith(month));
  const wonThisMonth = closedThisMonth.filter((d) => d.stageId === "closed_won");
  const lostThisMonth = closedThisMonth.filter((d) => d.stageId === "closed_lost");
  return {
    openCount: open.length,
    openValue: open.reduce((sum, d) => sum + d.valuePKR, 0),
    weighted: open.reduce((sum, d) => sum + d.valuePKR * dealProbability(d, stages), 0),
    wonCount: wonThisMonth.length,
    wonValue: wonThisMonth.reduce((sum, d) => sum + d.valuePKR, 0),
    winRate: wonThisMonth.length + lostThisMonth.length ? wonThisMonth.length / (wonThisMonth.length + lostThisMonth.length) : 0,
    lostCount: lostThisMonth.length,
  };
}

/** Applies a stage move, stamping close dates the way the backend will. */
export function moveDeal(deal: DealItem, stageId: PipelineStageId, now: string, lostReason: string | null = null): DealItem {
  const closing = !isOpenStage(stageId);
  return {
    ...deal,
    stageId,
    probability: null,
    closedAt: closing ? now : null,
    lostReason: stageId === "closed_lost" ? lostReason : null,
    updatedAt: now,
    hasLocalEdits: true,
  };
}
