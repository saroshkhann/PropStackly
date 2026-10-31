import type { PropertyImage } from "@/domain/property";
import type { SiteVisit } from "@/domain/site-visit";
import type { LeadPeekData } from "@/features/leads/components/lead-peek";
import type { AgentOption, MemberRef } from "@/features/workspace/types";

export interface VisitPropertyRef {
  id: string;
  title: string;
  location: string;
  address: string;
  cover: PropertyImage | undefined;
}

export interface VisitItem extends SiteVisit {
  agent: MemberRef | null;
  lead: LeadPeekData | null;
  property: VisitPropertyRef | null;
  isDraft?: boolean;
  hasLocalEdits?: boolean;
}

export interface SiteVisitsPageData {
  now: string;
  visits: VisitItem[];
  agents: AgentOption[];
  leads: LeadPeekData[];
  properties: VisitPropertyRef[];
}
