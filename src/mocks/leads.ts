import type { Lead, LeadIntent, LeadPriority, LeadSourceId, LeadStatus } from "@/domain/lead";
import { DEMO_AGENCY_ID } from "./agency";
import { demoContacts } from "./contacts";
import { hoursFromNow } from "./utils";

type Seed = [
  id: string,
  contactId: string,
  status: LeadStatus,
  priority: LeadPriority,
  source: LeadSourceId,
  intent: LeadIntent,
  interest: string,
  location: string,
  budgetMin: number,
  budgetMax: number,
  assignedToId: string | null,
  createdHoursAgo: number,
  activeHoursAgo: number,
];

const seeds: Seed[] = [
  ["led_1042", "con_kashif", "new", "hot", "zameen", "buy", "1 Kanal house", "DHA Phase 6, Lahore", 85_000_000, 110_000_000, "usr_bilal", 0.6, 0.6],
  ["led_1041", "con_rabia", "contacted", "warm", "meta_ads", "buy", "10 Marla house", "Bahria Town, Lahore", 32_000_000, 40_000_000, "usr_usman", 2.4, 1.1],
  ["led_1040", "con_faisal", "qualified", "hot", "referral", "invest", "Commercial plot", "Gulberg III, Lahore", 150_000_000, 220_000_000, "usr_ayesha", 5, 2],
  ["led_1039", "con_nadia", "site_visit", "warm", "zameen", "buy", "3-bed apartment", "Gulberg Heights, Lahore", 28_000_000, 35_000_000, "usr_fatima", 9, 3.5],
  ["led_1038", "con_adeel", "new", "warm", "whatsapp", "rent", "Upper portion, 1 Kanal", "DHA Phase 5, Lahore", 180_000, 230_000, "usr_zainab", 11, 11],
  ["led_1037", "con_mehwish", "negotiation", "hot", "graana", "buy", "5 Marla house", "Johar Town, Lahore", 19_000_000, 23_000_000, "usr_hassan", 20, 4],
  ["led_1036", "con_omer", "contacted", "warm", "website", "invest", "2 Kanal farmhouse plot", "Bedian Road, Lahore", 60_000_000, 80_000_000, "usr_bilal", 26, 8],
  ["led_1035", "con_hira", "qualified", "hot", "meta_ads", "buy", "1 Kanal plot", "DHA Phase 9 Prism, Lahore", 45_000_000, 55_000_000, "usr_ayesha", 31, 6],
  ["led_1034", "con_asad", "won", "warm", "referral", "buy", "8 Marla house", "Bahria Town, Lahore", 27_000_000, 31_000_000, "usr_usman", 52, 14],
  ["led_1033", "con_sadia", "site_visit", "warm", "zameen", "rent", "2-bed apartment", "Gulberg III, Lahore", 120_000, 150_000, "usr_zainab", 58, 20],
  ["led_1032", "con_junaid", "lost", "cold", "walk_in", "buy", "Shop, ground floor", "MM Alam Road, Lahore", 70_000_000, 90_000_000, "usr_fatima", 70, 30],
  ["led_1031", "con_maryam", "negotiation", "hot", "zameen", "buy", "1 Kanal house", "DHA Phase 5, Lahore", 95_000_000, 120_000_000, "usr_bilal", 80, 5],
  ["led_1030", "con_waqas", "contacted", "cold", "graana", "invest", "Apartment, off-plan", "Bahria Orchard, Lahore", 12_000_000, 16_000_000, "usr_hassan", 96, 40],
  ["led_1029", "con_amna", "qualified", "warm", "whatsapp", "buy", "10 Marla house", "Lake City, Lahore", 38_000_000, 46_000_000, "usr_fatima", 110, 22],
  ["led_1028", "con_shahzad", "new", "warm", "meta_ads", "buy", "5 Marla house", "Valencia Town, Lahore", 18_000_000, 22_000_000, null, 4, 4],
  ["led_1027", "con_saima", "contacted", "warm", "website", "rent", "Office floor", "Gulberg III, Lahore", 450_000, 600_000, "usr_zainab", 150, 46],
  ["led_1026", "con_usama", "qualified", "hot", "zameen", "invest", "Two 1 Kanal plots", "DHA Phase 8, Lahore", 70_000_000, 95_000_000, "usr_bilal", 170, 70],
  ["led_1025", "con_kiran", "site_visit", "warm", "referral", "buy", "10 Marla house", "Askari 11, Lahore", 36_000_000, 42_000_000, "usr_hassan", 200, 26],
  ["led_1024", "con_haris", "new", "cold", "walk_in", "buy", "5 Marla plot", "Johar Town, Lahore", 9_000_000, 12_000_000, null, 13, 13],
  ["led_1023", "con_fozia", "contacted", "warm", "meta_ads", "buy", "1 Kanal house", "Model Town, Lahore", 75_000_000, 90_000_000, "usr_fatima", 260, 60],
  ["led_1022", "con_zubair", "negotiation", "hot", "graana", "invest", "8 Marla commercial", "Bahria Town, Lahore", 85_000_000, 105_000_000, "usr_ayesha", 290, 90],
  ["led_1021", "con_anum", "won", "warm", "zameen", "rent", "Lower portion, 1 Kanal", "DHA Phase 6, Lahore", 160_000, 200_000, "usr_zainab", 310, 52],
  ["led_1020", "con_talha", "qualified", "hot", "referral", "buy", "2 Kanal house", "Lake City, Lahore", 150_000_000, 190_000_000, "usr_bilal", 340, 100],
  ["led_1019", "con_sobia", "lost", "cold", "website", "buy", "3-bed apartment", "Cantt, Lahore", 25_000_000, 30_000_000, "usr_usman", 380, 200],
  ["led_1018", "con_imtiaz", "site_visit", "hot", "walk_in", "invest", "4 Kanal farmhouse", "Bedian Road, Lahore", 120_000_000, 160_000_000, "usr_ayesha", 430, 150],
  ["led_1017", "con_rimsha", "contacted", "cold", "meta_ads", "buy", "2-bed apartment", "Gulberg III, Lahore", 18_000_000, 24_000_000, "usr_fatima", 480, 240],
  ["led_1016", "con_noman", "won", "warm", "graana", "buy", "Apartment, off-plan", "Bahria Orchard, Lahore", 11_000_000, 14_000_000, "usr_hassan", 530, 300],
  ["led_1015", "con_sehrish", "qualified", "warm", "zameen", "buy", "1 Kanal plot", "DHA Phase 6, Lahore", 48_000_000, 58_000_000, "usr_usman", 570, 180],
  ["led_1014", "con_danish", "lost", "cold", "whatsapp", "rent", "Upper portion, 10 Marla", "Johar Town, Lahore", 80_000, 100_000, "usr_zainab", 620, 330],
  ["led_1013", "con_mahnoor", "negotiation", "warm", "website", "buy", "10 Marla house", "Model Town, Lahore", 55_000_000, 65_000_000, "usr_fatima", 670, 400],
  ["led_1012", "con_yasir", "contacted", "warm", "zameen", "invest", "1 Kanal plot", "DHA Phase 9 Prism, Lahore", 40_000_000, 50_000_000, "usr_bilal", 720, 360],
  ["led_1011", "con_iqra", "new", "cold", "meta_ads", "buy", "5 Marla house", "Valencia Town, Lahore", 17_000_000, 20_000_000, null, 790, 500],
  ["led_1010", "con_fahad", "lost", "cold", "graana", "buy", "8 Marla house", "Askari 11, Lahore", 30_000_000, 34_000_000, "usr_usman", 860, 600],
  ["led_1009", "con_nida", "won", "warm", "zameen", "rent", "1-bed apartment", "Gulberg III, Lahore", 70_000, 90_000, "usr_zainab", 900, 700],
  ["led_1008", "con_arslan", "won", "hot", "referral", "buy", "10 Marla house", "Bahria Town, Lahore", 34_000_000, 38_000_000, "usr_ayesha", 940, 800],
  ["led_1007", "con_shazia", "lost", "warm", "walk_in", "buy", "1 Kanal house", "Johar Town, Lahore", 65_000_000, 75_000_000, "usr_fatima", 980, 900],
];

const contactsById = new Map(demoContacts.map((contact) => [contact.id, contact]));

export const demoLeads: Lead[] = seeds.map(
  ([id, contactId, status, priority, sourceId, intent, interest, location, budgetMinPKR, budgetMaxPKR, assignedToId, createdHoursAgo, activeHoursAgo]) => {
    const contact = contactsById.get(contactId);
    if (!contact) throw new Error(`Unknown contact ${contactId}`);
    return {
      id,
      agencyId: DEMO_AGENCY_ID,
      contactId,
      name: contact.name,
      phoneMasked: contact.phoneMasked,
      status,
      priority,
      sourceId,
      intent,
      interest,
      location,
      budgetMinPKR,
      budgetMaxPKR,
      assignedToId,
      createdAt: hoursFromNow(-createdHoursAgo),
      lastActivityAt: hoursFromNow(-activeHoursAgo),
    };
  },
);
