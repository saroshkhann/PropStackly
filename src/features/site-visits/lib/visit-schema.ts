import { z } from "zod";
import { dayKey } from "@/lib/format";
import type { VisitItem } from "../data/types";

export const visitFormSchema = z.object({
  leadId: z.string().min(1, "Choose the customer's lead"),
  propertyId: z.string().min(1, "Choose the property to show"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  durationMinutes: z.enum(["30", "45", "60", "90"]),
  assignedToId: z.string().min(1, "Assign an agent"),
  meetingPoint: z.string().trim().min(3, "Where should the agent meet the client?").max(140),
  priority: z.enum(["high", "normal"]),
  notes: z.string().trim().max(500),
});

export type VisitFormValues = z.infer<typeof visitFormSchema>;

function karachiTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Karachi" }).format(new Date(iso));
}

export function visitToFormValues(visit: VisitItem | null, now: string, date?: string): VisitFormValues {
  return {
    leadId: visit?.leadId ?? "",
    propertyId: visit?.propertyId ?? "",
    date: visit ? dayKey(visit.startsAt) : (date ?? dayKey(new Date(new Date(now).getTime() + 86_400_000).toISOString())),
    time: visit ? karachiTime(visit.startsAt) : "11:00",
    durationMinutes: String(visit?.durationMinutes ?? 45) as VisitFormValues["durationMinutes"],
    assignedToId: visit?.assignedToId ?? "",
    meetingPoint: visit?.meetingPoint ?? "",
    priority: visit?.priority ?? "normal",
    notes: visit?.notes ?? "",
  };
}

export const outcomeNoteSchema = z.object({ notes: z.string().trim().max(1000, "Keep notes under 1,000 characters") });
