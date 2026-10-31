import type { TenantScoped } from "./tenancy";

export type LeadStatus = "new" | "contacted" | "qualified" | "site_visit" | "negotiation" | "won" | "lost";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  site_visit: "Site visit",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export type LeadSourceId = "zameen" | "graana" | "meta_ads" | "whatsapp" | "referral" | "walk_in" | "website";

export interface LeadSource {
  id: LeadSourceId;
  label: string;
}

export type LeadIntent = "buy" | "rent" | "invest";

export const LEAD_INTENT_LABELS: Record<LeadIntent, string> = {
  buy: "Buy",
  rent: "Rent",
  invest: "Invest",
};

export type LeadPriority = "hot" | "warm" | "cold";

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];
export const LEAD_PRIORITIES = Object.keys(LEAD_PRIORITY_LABELS) as LeadPriority[];
export const LEAD_INTENTS: LeadIntent[] = ["buy", "rent", "invest"];

export const OPEN_LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "site_visit", "negotiation"];

export interface Lead extends TenantScoped {
  id: string;
  contactId: string;
  name: string;
  phoneMasked: string;
  status: LeadStatus;
  priority: LeadPriority;
  sourceId: LeadSourceId;
  intent: LeadIntent;
  interest: string;
  location: string;
  budgetMinPKR: number;
  budgetMaxPKR: number;
  /** Null while a lead waits in the unassigned queue. */
  assignedToId: string | null;
  createdAt: string;
  lastActivityAt: string;
}
