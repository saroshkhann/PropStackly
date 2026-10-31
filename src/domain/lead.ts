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

export interface Lead extends TenantScoped {
  id: string;
  name: string;
  phoneMasked: string;
  status: LeadStatus;
  sourceId: LeadSourceId;
  intent: LeadIntent;
  interest: string;
  location: string;
  budgetMinPKR: number;
  budgetMaxPKR: number;
  assignedToId: string;
  createdAt: string;
  lastActivityAt: string;
}
