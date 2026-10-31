import type { TenantScoped } from "./tenancy";

export type NotificationKind = "lead_assigned" | "site_visit" | "deal_update" | "trial" | "task_due";

export interface AppNotification extends TenantScoped {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
