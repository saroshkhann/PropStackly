import type { ListingPurpose } from "./property";
import type { TenantScoped } from "./tenancy";

export type PipelineStageId = "inquiry" | "qualified" | "site_visit" | "negotiation" | "token" | "closed_won" | "closed_lost";
export type OpenStageId = Exclude<PipelineStageId, "closed_won" | "closed_lost">;

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  order: number;
  /** Default win probability for forecasting; agencies will tune these once settings exist. */
  probability: number;
  outcome: "open" | "won" | "lost";
}

export const CLOSED_STAGES: PipelineStageId[] = ["closed_won", "closed_lost"];

export function isOpenStage(stageId: PipelineStageId): stageId is OpenStageId {
  return !CLOSED_STAGES.includes(stageId);
}

export const LOST_REASONS = [
  "Bought through another agency",
  "Budget mismatch",
  "Owner withdrew the property",
  "Financing fell through",
  "Client went silent",
  "Documentation issues",
] as const;

export interface Deal extends TenantScoped {
  id: string;
  title: string;
  purpose: ListingPurpose;
  customerName: string;
  leadId: string | null;
  contactId: string | null;
  propertyId: string | null;
  stageId: PipelineStageId;
  /** Sale price, or annual lease value for rentals. */
  valuePKR: number;
  /** Override for the stage's default probability, 0–1. */
  probability: number | null;
  ownerId: string;
  expectedCloseAt: string | null;
  closedAt: string | null;
  lostReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
