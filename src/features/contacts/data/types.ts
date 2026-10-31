import type { Contact } from "@/domain/contact";
import type { Property } from "@/domain/property";
import type { ActivityEntry, LeadListItem } from "@/features/leads/data/types";
import type { AgentOption, MemberRef } from "@/features/workspace/types";

export interface ContactListItem extends Contact {
  owner: MemberRef | null;
  leadCount: number;
  openLeadCount: number;
  propertyCount: number;
  /** Created or edited in this browser session only; never persisted. */
  isDraft?: boolean;
}

export interface ContactsPageData {
  now: string;
  contacts: ContactListItem[];
  agents: AgentOption[];
  tags: string[];
}

export interface ContactDetailData {
  now: string;
  contact: ContactListItem;
  leads: LeadListItem[];
  ownedProperties: Property[];
  interestedProperties: Property[];
  activities: ActivityEntry[];
  agents: AgentOption[];
  tags: string[];
}
