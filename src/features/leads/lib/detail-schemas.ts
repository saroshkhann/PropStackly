import { z } from "zod";

export const NOTE_KINDS = ["note", "call", "whatsapp", "email"] as const;

export const noteSchema = z.object({
  kind: z.enum(NOTE_KINDS),
  body: z.string().trim().min(3, "Write at least a few words").max(1000, "Keep it under 1,000 characters"),
});

export type NoteValues = z.infer<typeof noteSchema>;

export const followUpSchema = z
  .object({
    kind: z.enum(["follow_up", "site_visit"]),
    title: z.string().trim().min(3, "Give it a short title").max(80),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
    channel: z.enum(["call", "whatsapp", "meeting", "email"]),
    location: z.string().trim().max(120),
    assignedToId: z.string().min(1, "Choose who will handle it"),
    priority: z.enum(["high", "normal"]),
  })
  .refine((values) => values.kind !== "site_visit" || values.location.length >= 3, {
    path: ["location"],
    message: "Add the property address for the visit",
  });

export type FollowUpValues = z.infer<typeof followUpSchema>;

/** Wall-clock date and time entered by the user, interpreted in Asia/Karachi (UTC+5, no DST). */
export function karachiDateTimeToIso(date: string, time: string) {
  return new Date(`${date}T${time}:00+05:00`).toISOString();
}
