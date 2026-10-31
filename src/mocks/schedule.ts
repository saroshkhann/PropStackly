import type { ScheduleItem } from "@/domain/schedule";
import { DEMO_AGENCY_ID } from "./agency";
import { atLocalTime } from "./utils";

type Seed = Omit<ScheduleItem, "agencyId" | "startsAt"> & { day: number; hour: number; minute?: number };

const seeds: Seed[] = [
  { id: "sch_01", kind: "follow_up", title: "Share revised payment plan", leadName: "Mehwish Akram", location: null, channel: "whatsapp", day: 0, hour: 11, minute: 15, assignedToId: "usr_hassan", priority: "high" },
  { id: "sch_02", kind: "site_visit", title: "1 Kanal house viewing", leadName: "Maryam Zafar", location: "Street 12, DHA Phase 5", channel: null, day: 0, hour: 12, minute: 30, assignedToId: "usr_bilal", priority: "high" },
  { id: "sch_03", kind: "follow_up", title: "Confirm budget and financing", leadName: "Faisal Iqbal", location: null, channel: "call", day: 0, hour: 14, assignedToId: "usr_ayesha", priority: "normal" },
  { id: "sch_04", kind: "site_visit", title: "3-bed apartment walkthrough", leadName: "Nadia Hussain", location: "Gulberg Heights, Tower B", channel: null, day: 0, hour: 16, assignedToId: "usr_fatima", priority: "normal" },
  { id: "sch_05", kind: "follow_up", title: "Send shortlisted listings", leadName: "Rabia Anwar", location: null, channel: "whatsapp", day: 0, hour: 17, minute: 30, assignedToId: "usr_usman", priority: "normal" },
  { id: "sch_06", kind: "site_visit", title: "Rental unit inspection", leadName: "Sadia Khalid", location: "Main Boulevard, Gulberg III", channel: null, day: 1, hour: 11, assignedToId: "usr_zainab", priority: "normal" },
  { id: "sch_07", kind: "follow_up", title: "Token agreement meeting", leadName: "Hira Shahid", location: "Crescent office, DHA Phase 5", channel: "meeting", day: 1, hour: 13, assignedToId: "usr_ayesha", priority: "high" },
  { id: "sch_08", kind: "site_visit", title: "Farmhouse plot visit", leadName: "Omer Farooq", location: "Bedian Road", channel: null, day: 1, hour: 15, minute: 30, assignedToId: "usr_bilal", priority: "normal" },
  { id: "sch_09", kind: "follow_up", title: "Introductory call", leadName: "Kashif Mehmood", location: null, channel: "call", day: 1, hour: 10, assignedToId: "usr_bilal", priority: "high" },
];

export const demoSchedule: ScheduleItem[] = seeds
  .map(({ day, hour, minute, ...item }) => ({ ...item, agencyId: DEMO_AGENCY_ID, startsAt: atLocalTime(day, hour, minute) }))
  .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
