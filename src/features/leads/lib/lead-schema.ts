import { z } from "zod";
import { LEAD_INTENTS, LEAD_PRIORITIES, type LeadSourceId } from "@/domain/lead";
import { optionalEmailSchema, phoneSchema } from "@/lib/validation";

const LEAD_SOURCE_IDS = ["zameen", "graana", "meta_ads", "whatsapp", "referral", "walk_in", "website"] as const satisfies readonly LeadSourceId[];

const budgetSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value) => /^\d+$/.test(value.replace(/,/g, "")), "Numbers only")
  .transform((value) => Number(value.replace(/,/g, "")));

export const leadFormSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the client's full name").max(80, "Keep it under 80 characters"),
    phone: phoneSchema,
    email: optionalEmailSchema,
    intent: z.enum(LEAD_INTENTS),
    interest: z.string().trim().min(2, "Describe what they're looking for").max(80),
    location: z.string().trim().min(2, "Add a preferred area").max(80),
    budgetMin: budgetSchema,
    budgetMax: budgetSchema,
    sourceId: z.enum(LEAD_SOURCE_IDS),
    priority: z.enum(LEAD_PRIORITIES),
    assignedToId: z.string(),
    notes: z.string().trim().max(500, "Keep notes under 500 characters"),
  })
  .refine((values) => values.budgetMax >= values.budgetMin, {
    path: ["budgetMax"],
    message: "Max budget must be at least the minimum",
  });

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormValues = z.output<typeof leadFormSchema>;

export const leadFormDefaults: LeadFormInput = {
  name: "",
  phone: "",
  email: "",
  intent: "buy",
  interest: "",
  location: "",
  budgetMin: "",
  budgetMax: "",
  sourceId: "zameen",
  priority: "warm",
  assignedToId: "",
  notes: "",
};
