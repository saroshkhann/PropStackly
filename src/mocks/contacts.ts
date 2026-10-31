import type { Contact, ContactType } from "@/domain/contact";
import { DEMO_AGENCY_ID } from "./agency";
import { createRandom, hoursFromNow } from "./utils";

type Seed = [
  id: string,
  name: string,
  types: ContactType[],
  phoneMasked: string,
  hasWhatsApp: boolean,
  email: string | null,
  area: string,
  occupation: string | null,
  tags: string[],
  ownerId: string,
  createdDaysAgo: number,
  lastContactedHoursAgo: number | null,
  notes?: string,
];

const seeds: Seed[] = [
  ["con_kashif", "Kashif Mehmood", ["buyer"], "0300 ••• 4412", true, "kashif.m@example.com", "Cantt", "Textile exporter", ["High budget", "Overseas family"], "usr_bilal", 0, 0.6, "Prefers corner plots facing a park. Wife involved in final decision."],
  ["con_rabia", "Rabia Anwar", ["buyer"], "0321 ••• 7730", true, null, "Model Town", "School principal", ["First-time buyer"], "usr_usman", 0, 1.1],
  ["con_faisal", "Faisal Iqbal", ["investor", "buyer"], "0333 ••• 0918", true, "faisal.iqbal@example.com", "Gulberg III", "Pharmacy chain owner", ["Commercial", "Repeat client"], "usr_ayesha", 120, 2, "Bought two shops through us in 2025. Looking to expand on MM Alam Road."],
  ["con_nadia", "Nadia Hussain", ["buyer"], "0345 ••• 2267", true, "nadia.h@example.com", "Johar Town", "Doctor", ["Apartment"], "usr_fatima", 0.4, 3.5],
  ["con_adeel", "Adeel Butt", ["tenant"], "0302 ••• 5581", true, null, "DHA Phase 5", "Software engineer", ["Rental"], "usr_zainab", 0.5, 11],
  ["con_mehwish", "Mehwish Akram", ["buyer"], "0311 ••• 3049", true, null, "Johar Town", "Banker", ["Financing"], "usr_hassan", 1, 4, "Needs a bank-financed option; HBL pre-approval in progress."],
  ["con_omer", "Omer Farooq", ["investor"], "0322 ••• 8812", false, "omer.farooq@example.com", "Bedian Road", "Businessman", ["Farmhouse"], "usr_bilal", 1, 8],
  ["con_hira", "Hira Shahid", ["buyer"], "0334 ••• 1176", true, "hira.shahid@example.com", "DHA Phase 9", "Architect", ["Plot"], "usr_ayesha", 1.5, 6],
  ["con_asad", "Asad Mirza", ["buyer"], "0300 ••• 6620", true, null, "Bahria Town", "Government officer", ["Closed deal"], "usr_usman", 3, 14],
  ["con_sadia", "Sadia Khalid", ["tenant"], "0313 ••• 9035", true, "sadia.k@example.com", "Gulberg III", "Media producer", ["Rental"], "usr_zainab", 3, 20],
  ["con_junaid", "Junaid Aslam", ["buyer"], "0342 ••• 4458", false, null, "MM Alam Road", "Restaurateur", ["Commercial"], "usr_fatima", 3, 30],
  ["con_maryam", "Maryam Zafar", ["buyer", "seller"], "0305 ••• 7193", true, "maryam.zafar@example.com", "DHA Phase 5", "Professor", ["Upgrade", "Selling old house"], "usr_bilal", 4, 5, "Selling 10 Marla in Model Town to fund the DHA purchase."],
  ["con_waqas", "Waqas Chaudhry", ["investor"], "0331 ••• 2804", true, null, "Bahria Orchard", "Overseas (Dubai)", ["Overseas Pakistani", "Off-plan"], "usr_hassan", 4, 40],
  ["con_amna", "Amna Riaz", ["buyer"], "0320 ••• 6157", true, "amna.riaz@example.com", "Lake City", "Dentist", [], "usr_fatima", 5, 22],
  ["con_shahzad", "Shahzad Akhtar", ["buyer"], "0301 ••• 8840", true, null, "Valencia Town", "Transporter", [], "usr_usman", 6, 30],
  ["con_saima", "Saima Nawaz", ["tenant"], "0323 ••• 1904", true, "saima.n@example.com", "Gulberg III", "HR manager", ["Rental", "Corporate lease"], "usr_zainab", 7, 46],
  ["con_usama", "Usama Javaid", ["investor"], "0336 ••• 5521", true, "usama.j@example.com", "DHA Phase 8", "IT entrepreneur", ["Plot"], "usr_bilal", 8, 70],
  ["con_kiran", "Kiran Masood", ["buyer"], "0315 ••• 6638", true, null, "Askari 11", "Lecturer", ["Army family"], "usr_hassan", 9, 26],
  ["con_haris", "Haris Siddique", ["buyer"], "0300 ••• 2219", false, null, "Johar Town", "Shop owner", [], "usr_hassan", 10, 120],
  ["con_fozia", "Fozia Rehman", ["buyer"], "0346 ••• 7012", true, "fozia.r@example.com", "Model Town", "Homemaker", ["Overseas family"], "usr_fatima", 11, 60],
  ["con_zubair", "Zubair Khan", ["investor"], "0333 ••• 4470", true, null, "Bahria Town", "Contractor", ["Commercial"], "usr_ayesha", 12, 90],
  ["con_anum", "Anum Tariq", ["tenant"], "0324 ••• 3381", true, "anum.t@example.com", "DHA Phase 6", "Consultant", ["Rental"], "usr_zainab", 13, 52],
  ["con_talha", "Talha Rashid", ["buyer"], "0306 ••• 9946", true, null, "Lake City", "Cardiologist", ["High budget"], "usr_bilal", 14, 100],
  ["con_sobia", "Sobia Irfan", ["buyer"], "0312 ••• 0273", true, "sobia.irfan@example.com", "Cantt", "Civil servant", [], "usr_usman", 16, 200],
  ["con_imtiaz", "Imtiaz Gondal", ["investor", "buyer"], "0341 ••• 6608", false, null, "Bedian Road", "Agriculturist", ["Farmhouse", "Cash buyer"], "usr_ayesha", 18, 150],
  ["con_rimsha", "Rimsha Aziz", ["buyer"], "0322 ••• 7745", true, "rimsha.aziz@example.com", "Gulberg III", "Brand manager", ["Apartment"], "usr_fatima", 20, 240],
  ["con_noman", "Noman Sheikh", ["buyer"], "0300 ••• 3392", true, null, "Bahria Orchard", "Wholesaler", [], "usr_hassan", 22, 300],
  ["con_sehrish", "Sehrish Kamran", ["buyer"], "0335 ••• 1150", true, "sehrish.k@example.com", "DHA Phase 6", "Pharmacist", [], "usr_usman", 24, 180],
  ["con_danish", "Danish Baig", ["tenant"], "0304 ••• 6087", true, null, "Johar Town", "Bank officer", ["Rental"], "usr_zainab", 26, 330],
  ["con_mahnoor", "Mahnoor Ali", ["buyer"], "0316 ••• 2738", true, "mahnoor.ali@example.com", "Model Town", "Fashion designer", [], "usr_fatima", 28, 400],
  ["con_yasir", "Yasir Abbasi", ["investor"], "0343 ••• 9901", true, null, "DHA Phase 9", "Overseas (Riyadh)", ["Overseas Pakistani", "Plot"], "usr_bilal", 30, 360],
  ["con_iqra", "Iqra Saleem", ["buyer"], "0321 ••• 5416", true, null, "Valencia Town", "Teacher", ["First-time buyer"], "usr_hassan", 33, 500],
  ["con_fahad", "Fahad Lodhi", ["buyer"], "0307 ••• 8823", false, "fahad.lodhi@example.com", "Askari 11", "Engineer", [], "usr_usman", 36, 600],
  ["con_nida", "Nida Pervaiz", ["tenant"], "0332 ••• 4402", true, null, "Gulberg III", "Journalist", ["Rental"], "usr_zainab", 38, 700],
  ["con_arslan", "Arslan Qadir", ["buyer"], "0300 ••• 7564", true, null, "Bahria Town", "Pilot", ["Cash buyer"], "usr_ayesha", 40, 800],
  ["con_shazia", "Shazia Hameed", ["buyer"], "0314 ••• 3125", true, "shazia.h@example.com", "Johar Town", "Gynaecologist", [], "usr_fatima", 42, 900],
  ["con_nasir", "Chaudhry Nasir Ahmed", ["seller"], "0300 ••• 1187", true, null, "DHA Phase 5", "Landowner", ["Exclusive mandate", "Multiple listings"], "usr_ayesha", 90, 30, "Owns several units in DHA; prefers dealing through Ayesha only."],
  ["con_farah", "Farah Durrani", ["landlord"], "0322 ••• 9061", true, "farah.durrani@example.com", "Gulberg III", "Retired", ["Rental portfolio"], "usr_zainab", 140, 48],
  ["con_rauf", "Sheikh Abdul Rauf", ["seller", "investor"], "0333 ••• 7330", false, null, "Model Town", "Industrialist", ["Commercial", "Multiple listings"], "usr_bilal", 200, 96],
  ["con_tariq", "Tariq Mahmood", ["seller"], "0345 ••• 0094", true, null, "Askari 11", "Retired army officer", [], "usr_hassan", 60, 72],
  ["con_rukhsana", "Rukhsana Bibi", ["landlord"], "0301 ••• 6650", true, null, "Johar Town", null, ["Rental portfolio"], "usr_zainab", 75, 160],
  ["con_ghulam", "Ghulam Mustafa Traders", ["seller"], "042 ••• 7781", false, "accounts@gmtraders.example.com", "Bahria Town", "Company", ["Commercial", "Builder"], "usr_ayesha", 160, 220, "Builder with off-plan apartments in Bahria Orchard."],
  ["con_saqib", "Saqib Rasheed", ["landlord", "seller"], "0336 ••• 2245", true, "saqib.r@example.com", "DHA Phase 6", "Overseas (UK)", ["Overseas Pakistani"], "usr_fatima", 100, 260],
  ["con_hina", "Hina Butt", ["seller"], "0311 ••• 8836", true, null, "Lake City", "Homemaker", [], "usr_usman", 50, 140],
];

const ownerNames = [
  "Mian Tanveer Ahmad", "Nusrat Parveen", "Khalid Mehmood Bhatti", "Shaista Gill", "Raja Fawad Akram", "Tahira Yasmeen",
  "Malik Sarfraz Ahmad", "Zahida Perveen", "Abdul Waheed Khan", "Rehana Kausar", "Haji Muhammad Aslam", "Samina Rauf",
  "Gulshan Traders", "Ambreen Sajjad", "Qamar Shahzad", "Lubna Saeed", "Mirza Haroon Baig", "Robina Shafiq",
  "Sardar Ali Raza", "Kausar Jabeen", "Noor Developers", "Nasreen Akhtar",
];
const ownerAreas = ["DHA Phase 5", "DHA Phase 6", "Gulberg III", "Model Town", "Johar Town", "Bahria Town", "Cantt", "Lake City"];
const ownerJobs = ["Retired", "Businessman", "Overseas (UK)", "Overseas (Dubai)", "Landowner", "Homemaker", "Doctor", "Builder"];
const ownerRandom = createRandom(3141);

/** Owners who list properties with the agency but are not active buyers. */
const ownerSeeds: Seed[] = ownerNames.map((name, index) => {
  const company = /Traders|Developers/.test(name);
  return [
    `con_owner_${(index + 1).toString().padStart(2, "0")}`,
    name,
    index % 4 === 3 ? ["landlord"] : company ? ["seller", "investor"] : ["seller"],
    `03${ownerRandom.int(0, 4)}${ownerRandom.int(0, 9)} ••• ${ownerRandom.int(1000, 9999)}`,
    ownerRandom.next() > 0.2,
    company ? `info@${name.split(" ")[0]!.toLowerCase().replace(/[^a-z]/g, "")}.example.com` : null,
    ownerRandom.pick(ownerAreas),
    company ? "Company" : ownerRandom.pick(ownerJobs),
    company ? ["Builder", "Multiple listings"] : [],
    ownerRandom.pick(["usr_ayesha", "usr_bilal", "usr_fatima", "usr_usman", "usr_zainab", "usr_hassan"]),
    ownerRandom.int(20, 300),
    ownerRandom.int(24, 900),
  ];
});

export const demoContacts: Contact[] = [...seeds, ...ownerSeeds].map(
  ([id, name, types, phoneMasked, hasWhatsApp, email, area, occupation, tags, ownerId, createdDaysAgo, lastContactedHoursAgo, notes]) => ({
    id,
    agencyId: DEMO_AGENCY_ID,
    name,
    types,
    phoneMasked,
    hasWhatsApp,
    email,
    city: "Lahore",
    area,
    occupation,
    tags,
    ownerId,
    notes: notes ?? null,
    createdAt: hoursFromNow(-createdDaysAgo * 24 - 2),
    lastContactedAt: lastContactedHoursAgo === null ? null : hoursFromNow(-lastContactedHoursAgo),
  }),
);
