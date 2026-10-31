import type { TenantScoped } from "./tenancy";

export type PipelineStageId = "inquiry" | "qualified" | "site_visit" | "negotiation" | "token" | "closed_won";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  order: number;
}

export interface Deal extends TenantScoped {
  id: string;
  title: string;
  leadId: string;
  propertyId: string | null;
  stageId: PipelineStageId;
  valuePKR: number;
  ownerId: string;
  updatedAt: string;
}
