import type { Lead } from "@/domain/lead";
import { DEMO_AGENCY_ID } from "./agency";
import { hoursFromNow } from "./utils";

type LeadSeed = Omit<Lead, "agencyId" | "createdAt" | "lastActivityAt"> & { createdHoursAgo: number; activeHoursAgo: number };

const seeds: LeadSeed[] = [
  { id: "led_1042", name: "Kashif Mehmood", phoneMasked: "0300 ••• 4412", status: "new", sourceId: "zameen", intent: "buy", interest: "1 Kanal house", location: "DHA Phase 6, Lahore", budgetMinPKR: 85_000_000, budgetMaxPKR: 110_000_000, assignedToId: "usr_bilal", createdHoursAgo: 0.6, activeHoursAgo: 0.6 },
  { id: "led_1041", name: "Rabia Anwar", phoneMasked: "0321 ••• 7730", status: "contacted", sourceId: "meta_ads", intent: "buy", interest: "10 Marla house", location: "Bahria Town, Lahore", budgetMinPKR: 32_000_000, budgetMaxPKR: 40_000_000, assignedToId: "usr_usman", createdHoursAgo: 2.4, activeHoursAgo: 1.1 },
  { id: "led_1040", name: "Faisal Iqbal", phoneMasked: "0333 ••• 0918", status: "qualified", sourceId: "referral", intent: "invest", interest: "Commercial plot", location: "Gulberg III, Lahore", budgetMinPKR: 150_000_000, budgetMaxPKR: 220_000_000, assignedToId: "usr_ayesha", createdHoursAgo: 5, activeHoursAgo: 2 },
  { id: "led_1039", name: "Nadia Hussain", phoneMasked: "0345 ••• 2267", status: "site_visit", sourceId: "zameen", intent: "buy", interest: "3-bed apartment", location: "Gulberg Heights, Lahore", budgetMinPKR: 28_000_000, budgetMaxPKR: 35_000_000, assignedToId: "usr_fatima", createdHoursAgo: 9, activeHoursAgo: 3.5 },
  { id: "led_1038", name: "Adeel Butt", phoneMasked: "0302 ••• 5581", status: "new", sourceId: "whatsapp", intent: "rent", interest: "Upper portion, 1 Kanal", location: "DHA Phase 5, Lahore", budgetMinPKR: 180_000, budgetMaxPKR: 230_000, assignedToId: "usr_zainab", createdHoursAgo: 11, activeHoursAgo: 11 },
  { id: "led_1037", name: "Mehwish Akram", phoneMasked: "0311 ••• 3049", status: "negotiation", sourceId: "graana", intent: "buy", interest: "5 Marla house", location: "Johar Town, Lahore", budgetMinPKR: 19_000_000, budgetMaxPKR: 23_000_000, assignedToId: "usr_hassan", createdHoursAgo: 20, activeHoursAgo: 4 },
  { id: "led_1036", name: "Omer Farooq", phoneMasked: "0322 ••• 8812", status: "contacted", sourceId: "website", intent: "invest", interest: "2 Kanal farmhouse plot", location: "Bedian Road, Lahore", budgetMinPKR: 60_000_000, budgetMaxPKR: 80_000_000, assignedToId: "usr_bilal", createdHoursAgo: 26, activeHoursAgo: 8 },
  { id: "led_1035", name: "Hira Shahid", phoneMasked: "0334 ••• 1176", status: "qualified", sourceId: "meta_ads", intent: "buy", interest: "1 Kanal plot", location: "DHA Phase 9 Prism, Lahore", budgetMinPKR: 45_000_000, budgetMaxPKR: 55_000_000, assignedToId: "usr_ayesha", createdHoursAgo: 31, activeHoursAgo: 6 },
  { id: "led_1034", name: "Asad Mirza", phoneMasked: "0300 ••• 6620", status: "won", sourceId: "referral", intent: "buy", interest: "8 Marla house", location: "Bahria Town, Lahore", budgetMinPKR: 27_000_000, budgetMaxPKR: 31_000_000, assignedToId: "usr_usman", createdHoursAgo: 52, activeHoursAgo: 14 },
  { id: "led_1033", name: "Sadia Khalid", phoneMasked: "0313 ••• 9035", status: "site_visit", sourceId: "zameen", intent: "rent", interest: "2-bed apartment", location: "Gulberg III, Lahore", budgetMinPKR: 120_000, budgetMaxPKR: 150_000, assignedToId: "usr_zainab", createdHoursAgo: 58, activeHoursAgo: 20 },
  { id: "led_1032", name: "Junaid Aslam", phoneMasked: "0342 ••• 4458", status: "lost", sourceId: "walk_in", intent: "buy", interest: "Shop, ground floor", location: "MM Alam Road, Lahore", budgetMinPKR: 70_000_000, budgetMaxPKR: 90_000_000, assignedToId: "usr_fatima", createdHoursAgo: 70, activeHoursAgo: 30 },
  { id: "led_1031", name: "Maryam Zafar", phoneMasked: "0305 ••• 7193", status: "negotiation", sourceId: "zameen", intent: "buy", interest: "1 Kanal house", location: "DHA Phase 5, Lahore", budgetMinPKR: 95_000_000, budgetMaxPKR: 120_000_000, assignedToId: "usr_bilal", createdHoursAgo: 80, activeHoursAgo: 5 },
  { id: "led_1030", name: "Waqas Chaudhry", phoneMasked: "0331 ••• 2804", status: "contacted", sourceId: "graana", intent: "invest", interest: "Apartment, off-plan", location: "Bahria Orchard, Lahore", budgetMinPKR: 12_000_000, budgetMaxPKR: 16_000_000, assignedToId: "usr_hassan", createdHoursAgo: 96, activeHoursAgo: 40 },
  { id: "led_1029", name: "Amna Riaz", phoneMasked: "0320 ••• 6157", status: "qualified", sourceId: "whatsapp", intent: "buy", interest: "10 Marla house", location: "Lake City, Lahore", budgetMinPKR: 38_000_000, budgetMaxPKR: 46_000_000, assignedToId: "usr_fatima", createdHoursAgo: 110, activeHoursAgo: 22 },
];

export const demoLeads: Lead[] = seeds.map(({ createdHoursAgo, activeHoursAgo, ...lead }) => ({
  ...lead,
  agencyId: DEMO_AGENCY_ID,
  createdAt: hoursFromNow(-createdHoursAgo),
  lastActivityAt: hoursFromNow(-activeHoursAgo),
}));
