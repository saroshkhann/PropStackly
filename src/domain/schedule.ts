import type { TenantScoped } from "./tenancy";

/*
 * Unified agenda entry used by the dashboard, lead follow-ups, and the nav badge.
 * Derived from tasks (follow-ups) and site visits rather than stored on its own.
 */

export type ScheduleItemKind = "site_visit" | "follow_up";
export type FollowUpChannel = "call" | "whatsapp" | "meeting" | "email";

export interface ScheduleItem extends TenantScoped {
  id: string;
  kind: ScheduleItemKind;
  leadId: string | null;
  title: string;
  leadName: string;
  location: string | null;
  channel: FollowUpChannel | null;
  startsAt: string;
  assignedToId: string;
  priority: "high" | "normal";
  completedAt: string | null;
}
