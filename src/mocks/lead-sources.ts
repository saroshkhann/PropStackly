import type { LeadSource } from "@/domain/lead";

export const leadSources: LeadSource[] = [
  { id: "zameen", label: "Zameen.com" },
  { id: "meta_ads", label: "Facebook & Instagram ads" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "graana", label: "Graana" },
  { id: "referral", label: "Referral" },
  { id: "walk_in", label: "Walk-in" },
  { id: "website", label: "Agency website" },
];

/** Share of inbound leads per source, used to split generated lead volume. */
export const leadSourceWeights: Record<LeadSource["id"], number> = {
  zameen: 0.31,
  meta_ads: 0.22,
  whatsapp: 0.16,
  graana: 0.11,
  referral: 0.09,
  walk_in: 0.07,
  website: 0.04,
};
