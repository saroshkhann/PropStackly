import type { Deal, PipelineStage } from "@/domain/deal";
import type { ListingPurpose, PropertyImage } from "@/domain/property";
import type { AgentOption, MemberRef } from "@/features/workspace/types";

export interface DealPropertyRef {
  id: string;
  title: string;
  location: string;
  pricePKR: number;
  purpose: ListingPurpose;
  cover: PropertyImage | undefined;
}

export interface DealItem extends Deal {
  owner: MemberRef | null;
  property: DealPropertyRef | null;
  customerPhoneMasked: string | null;
  /** Created or changed in this browser session only. */
  isDraft?: boolean;
  hasLocalEdits?: boolean;
}

export interface LeadOption {
  id: string;
  name: string;
  contactId: string;
  interest: string;
  phoneMasked: string;
}

export interface PipelinePageData {
  now: string;
  stages: PipelineStage[];
  deals: DealItem[];
  agents: AgentOption[];
  leads: LeadOption[];
  properties: DealPropertyRef[];
}
