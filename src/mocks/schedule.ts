import type { ScheduleItem } from "@/domain/schedule";
import { DEMO_AGENCY_ID } from "./agency";
import { demoLeads } from "./leads";
import { atLocalTime } from "./utils";

type Seed = Omit<ScheduleItem, "agencyId" | "startsAt" | "leadId" | "completedAt"> & {
  day: number;
  hour: number;
  minute?: number;
  done?: boolean;
};

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
  { id: "sch_10", kind: "follow_up", title: "Check bank financing status", leadName: "Mehwish Akram", location: null, channel: "call", day: -1, hour: 16, assignedToId: "usr_hassan", priority: "normal", done: true },
  { id: "sch_11", kind: "site_visit", title: "Plot 412 viewing", leadName: "Hira Shahid", location: "Block Q, DHA Phase 9 Prism", channel: null, day: -1, hour: 11, assignedToId: "usr_ayesha", priority: "normal", done: true },
  { id: "sch_12", kind: "follow_up", title: "Send token agreement draft", leadName: "Maryam Zafar", location: null, channel: "email", day: -1, hour: 18, assignedToId: "usr_bilal", priority: "high" },
  { id: "sch_13", kind: "follow_up", title: "Follow up on Model Town sale", leadName: "Maryam Zafar", location: null, channel: "whatsapp", day: 2, hour: 12, assignedToId: "usr_bilal", priority: "normal" },
  { id: "sch_14", kind: "follow_up", title: "Revive conversation", leadName: "Waqas Chaudhry", location: null, channel: "whatsapp", day: -2, hour: 15, assignedToId: "usr_hassan", priority: "normal" },
  { id: "sch_15", kind: "follow_up", title: "Share commercial plot options", leadName: "Faisal Iqbal", location: null, channel: "email", day: 3, hour: 11, assignedToId: "usr_ayesha", priority: "normal" },
  { id: "sch_16", kind: "site_visit", title: "Second visit with family", leadName: "Nadia Hussain", location: "Gulberg Heights, Tower B", channel: null, day: 4, hour: 17, assignedToId: "usr_fatima", priority: "normal" },
  { id: "sch_17", kind: "site_visit", title: "Farmhouse walkthrough", leadName: "Imtiaz Gondal", location: "Bedian Road", channel: null, day: -3, hour: 10, assignedToId: "usr_ayesha", priority: "normal", done: true },
  { id: "sch_18", kind: "follow_up", title: "Discuss counter-offer", leadName: "Zubair Khan", location: null, channel: "meeting", day: 0, hour: 9, minute: 30, assignedToId: "usr_ayesha", priority: "high" },
];

const leadIdByName = new Map(demoLeads.map((lead) => [lead.name, lead.id]));

export const demoSchedule: ScheduleItem[] = seeds
  .map(({ day, hour, minute, done, ...item }) => {
    const startsAt = atLocalTime(day, hour, minute);
    return {
      ...item,
      agencyId: DEMO_AGENCY_ID,
      leadId: leadIdByName.get(item.leadName) ?? null,
      startsAt,
      completedAt: done ? startsAt : null,
    };
  })
  .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
