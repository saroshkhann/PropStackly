import type { Activity } from "@/domain/activity";
import type { Contact } from "@/domain/contact";
import type { Lead, LeadSource } from "@/domain/lead";
import type { Property } from "@/domain/property";
import type { ScheduleItem } from "@/domain/schedule";
import type { AgentOption, MemberRef } from "@/features/workspace/types";

export interface LeadListItem extends Lead {
  assignedTo: MemberRef | null;
  sourceLabel: string;
  /** Added in this browser session only; never persisted. */
  isDraft?: boolean;
}

export interface ActivityEntry extends Activity {
  actorName: string | null;
  isDraft?: boolean;
}

export interface FollowUpEntry extends ScheduleItem {
  assignedTo: MemberRef | null;
  isDraft?: boolean;
}

export interface LeadsPageData {
  now: string;
  leads: LeadListItem[];
  agents: AgentOption[];
  sources: LeadSource[];
}

export interface LeadDetailData {
  now: string;
  lead: LeadListItem;
  contact: Contact;
  activities: ActivityEntry[];
  followUps: FollowUpEntry[];
  properties: Property[];
  agents: AgentOption[];
  sources: LeadSource[];
}
