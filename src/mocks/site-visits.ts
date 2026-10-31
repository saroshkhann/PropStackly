import type { SiteVisit, VisitOutcome, VisitStatus } from "@/domain/site-visit";
import { DEMO_AGENCY_ID } from "./agency";
import { demoLeads } from "./leads";
import { demoProperties, matchingPropertyIds } from "./properties";
import { atLocalTime, createRandom } from "./utils";

const random = createRandom(4242);
const propertyById = new Map(demoProperties.map((p) => [p.id, p]));

type Seed = {
  id: string;
  leadName: string;
  day: number;
  hour: number;
  minute?: number;
  status: VisitStatus;
  outcome?: VisitOutcome;
  notes?: string;
  priority?: "high" | "normal";
};

const seeds: Seed[] = [
  { id: "vis_01", leadName: "Maryam Zafar", day: 0, hour: 12, minute: 30, status: "confirmed", priority: "high" },
  { id: "vis_02", leadName: "Nadia Hussain", day: 0, hour: 16, status: "confirmed" },
  { id: "vis_03", leadName: "Sadia Khalid", day: 1, hour: 11, status: "scheduled" },
  { id: "vis_04", leadName: "Omer Farooq", day: 1, hour: 15, minute: 30, status: "scheduled" },
  { id: "vis_05", leadName: "Hira Shahid", day: -1, hour: 11, status: "completed", outcome: "very_interested", notes: "Liked the plot orientation; wants to discuss token amount tomorrow." },
  { id: "vis_06", leadName: "Nadia Hussain", day: 4, hour: 17, status: "scheduled", notes: "Second visit with family." },
  { id: "vis_07", leadName: "Imtiaz Gondal", day: -3, hour: 10, status: "completed", outcome: "offer_made", notes: "Offered PKR 1.35 Cr below asking; owner considering." },
  { id: "vis_08", leadName: "Kiran Masood", day: -4, hour: 16, status: "completed", outcome: "interested", notes: "Concerned about street width; wants to compare with Block C." },
  { id: "vis_09", leadName: "Talha Rashid", day: -6, hour: 12, status: "no_show", notes: "Client unreachable on the day; rescheduling." },
  { id: "vis_10", leadName: "Mehwish Akram", day: -8, hour: 11, status: "completed", outcome: "offer_made" },
  { id: "vis_11", leadName: "Amna Riaz", day: 2, hour: 11, minute: 30, status: "scheduled" },
  { id: "vis_12", leadName: "Faisal Iqbal", day: 3, hour: 15, status: "scheduled", priority: "high" },
  { id: "vis_13", leadName: "Zubair Khan", day: -10, hour: 14, status: "completed", outcome: "very_interested" },
  { id: "vis_14", leadName: "Sehrish Kamran", day: -12, hour: 12, status: "completed", outcome: "needs_time" },
  { id: "vis_15", leadName: "Rimsha Aziz", day: -13, hour: 17, status: "cancelled", notes: "Client postponed; travelling to Karachi." },
  { id: "vis_16", leadName: "Usama Javaid", day: 6, hour: 11, status: "scheduled" },
  { id: "vis_17", leadName: "Mahnoor Ali", day: -15, hour: 16, status: "completed", outcome: "not_interested", notes: "Layout too small for joint family." },
  { id: "vis_18", leadName: "Rabia Anwar", day: 8, hour: 12, status: "scheduled" },
  { id: "vis_19", leadName: "Shahzad Akhtar", day: 10, hour: 15, status: "scheduled" },
  { id: "vis_20", leadName: "Kashif Mehmood", day: 12, hour: 11, status: "scheduled", priority: "high" },
  { id: "vis_21", leadName: "Fozia Rehman", day: -18, hour: 11, status: "completed", outcome: "interested" },
  { id: "vis_22", leadName: "Arslan Qadir", day: -21, hour: 15, status: "completed", outcome: "offer_made" },
  { id: "vis_23", leadName: "Usama Javaid", day: -1, hour: 17, status: "confirmed", notes: "Showing two adjacent plots." },
];

const leadByName = new Map(demoLeads.map((lead) => [lead.name, lead]));

export const demoSiteVisits: SiteVisit[] = seeds
  .map((seed): SiteVisit => {
    const lead = leadByName.get(seed.leadName);
    if (!lead) throw new Error(`Unknown lead ${seed.leadName}`);
    const propertyId = matchingPropertyIds(lead, 2)[random.int(0, 1)] ?? matchingPropertyIds(lead)[0] ?? null;
    const property = propertyId ? propertyById.get(propertyId) : undefined;
    return {
      id: seed.id,
      agencyId: DEMO_AGENCY_ID,
      title: property ? `${property.title} viewing` : `${lead.interest} viewing`,
      leadId: lead.id,
      customerName: lead.name,
      customerPhoneMasked: lead.phoneMasked,
      propertyId,
      meetingPoint: property ? `${property.address}, ${property.location}` : lead.location,
      startsAt: atLocalTime(seed.day, seed.hour, seed.minute),
      durationMinutes: random.pick([30, 45, 60]),
      assignedToId: lead.assignedToId ?? "usr_ayesha",
      status: seed.status,
      outcome: seed.outcome ?? null,
      notes: seed.notes ?? null,
      priority: seed.priority ?? "normal",
    };
  })
  .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
