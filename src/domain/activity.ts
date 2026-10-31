import type { TenantScoped } from "./tenancy";

export type ActivityKind =
  | "created"
  | "note"
  | "call"
  | "whatsapp"
  | "email"
  | "status_change"
  | "assignment"
  | "site_visit"
  | "follow_up";

export interface Activity extends TenantScoped {
  id: string;
  kind: ActivityKind;
  leadId: string | null;
  contactId: string | null;
  actorId: string | null;
  title: string;
  body: string | null;
  createdAt: string;
}
