import { z } from "zod";
import type { PipelineStageId } from "@/domain/deal";
import type { DealItem } from "../data/types";

const STAGE_IDS = ["inquiry", "qualified", "site_visit", "negotiation", "token", "closed_won", "closed_lost"] as const satisfies readonly PipelineStageId[];

export const dealFormSchema = z
  .object({
    title: z.string().trim().min(4, "Give the deal a short name").max(90),
    customerName: z.string().trim().min(2, "Who is buying or renting?").max(80),
    leadId: z.string(),
    propertyId: z.string(),
    purpose: z.enum(["sale", "rent"]),
    value: z
      .string()
      .trim()
      .min(1, "Deal value is required")
      .refine((v) => /^\d+$/.test(v.replace(/,/g, "")), "Numbers only")
      .transform((v) => Number(v.replace(/,/g, ""))),
    stageId: z.enum(STAGE_IDS),
    probability: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 100), "0–100")
      .transform((v) => (v === "" ? null : Number(v) / 100)),
    expectedClose: z.string(),
    ownerId: z.string().min(1, "Assign an agent"),
    lostReason: z.string(),
    notes: z.string().trim().max(1000),
  })
  .refine((v) => v.stageId !== "closed_lost" || v.lostReason.length > 0, { path: ["lostReason"], message: "Pick a reason so the team can learn from it" });

export type DealFormInput = z.input<typeof dealFormSchema>;
export type DealFormValues = z.output<typeof dealFormSchema>;

export function dealToFormInput(deal: DealItem | null, now: string): DealFormInput {
  return {
    title: deal?.title ?? "",
    customerName: deal?.customerName ?? "",
    leadId: deal?.leadId ?? "",
    propertyId: deal?.propertyId ?? "",
    purpose: deal?.purpose ?? "sale",
    value: deal ? String(deal.valuePKR) : "",
    stageId: deal?.stageId ?? "inquiry",
    probability: deal?.probability !== null && deal?.probability !== undefined ? String(Math.round(deal.probability * 100)) : "",
    expectedClose: deal?.expectedCloseAt ? deal.expectedCloseAt.slice(0, 10) : new Date(new Date(now).getTime() + 30 * 86_400_000).toISOString().slice(0, 10),
    ownerId: deal?.ownerId ?? "",
    lostReason: deal?.lostReason ?? "",
    notes: deal?.notes ?? "",
  };
}
