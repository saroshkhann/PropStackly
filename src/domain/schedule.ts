import type { TenantScoped } from "./tenancy";

export type ScheduleItemKind = "site_visit" | "follow_up";
export type FollowUpChannel = "call" | "whatsapp" | "meeting" | "email";

export interface ScheduleItem extends TenantScoped {
  id: string;
  kind: ScheduleItemKind;
  title: string;
  leadName: string;
  location: string | null;
  channel: FollowUpChannel | null;
  startsAt: string;
  assignedToId: string;
  priority: "high" | "normal";
}
