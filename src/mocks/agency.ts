import type { Agency, AgencyMember } from "@/domain/agency";
import type { AgencySubscription } from "@/domain/subscription";
import { atLocalTime } from "./utils";

export const DEMO_AGENCY_ID = "agc_crescent_lhr";

export const demoAgency: Agency = {
  id: DEMO_AGENCY_ID,
  name: "Crescent Realty & Builders",
  slug: "crescent-realty",
  city: "Lahore",
  timezone: "Asia/Karachi",
  createdAt: atLocalTime(-1, 12, 15),
};

export const demoSubscription: AgencySubscription = {
  agencyId: DEMO_AGENCY_ID,
  state: "trialing",
  planName: null,
  trialStartedAt: atLocalTime(-1, 12, 15),
};

const member = (m: Omit<AgencyMember, "agencyId">): AgencyMember => ({ ...m, agencyId: DEMO_AGENCY_ID });

export const demoMembers: AgencyMember[] = [
  member({ id: "usr_hamza", name: "Hamza Qureshi", email: "hamza@crescent.example", role: "owner", title: "Chief Executive", branch: "DHA Phase 5", monthlyTargetPKR: 0 }),
  member({ id: "usr_ayesha", name: "Ayesha Siddiqui", email: "ayesha@crescent.example", role: "manager", title: "Sales Manager", branch: "DHA Phase 5", monthlyTargetPKR: 90_000_000 }),
  member({ id: "usr_bilal", name: "Bilal Ahmed", email: "bilal@crescent.example", role: "agent", title: "Senior Agent", branch: "DHA Phase 5", monthlyTargetPKR: 90_000_000 }),
  member({ id: "usr_fatima", name: "Fatima Noor", email: "fatima@crescent.example", role: "agent", title: "Property Consultant", branch: "Gulberg III", monthlyTargetPKR: 70_000_000 }),
  member({ id: "usr_usman", name: "Usman Tariq", email: "usman@crescent.example", role: "agent", title: "Property Consultant", branch: "Bahria Town", monthlyTargetPKR: 70_000_000 }),
  member({ id: "usr_zainab", name: "Zainab Malik", email: "zainab@crescent.example", role: "agent", title: "Rentals Specialist", branch: "Gulberg III", monthlyTargetPKR: 30_000_000 }),
  member({ id: "usr_hassan", name: "Hassan Raza", email: "hassan@crescent.example", role: "agent", title: "Junior Agent", branch: "Bahria Town", monthlyTargetPKR: 50_000_000 }),
];

export const DEMO_CURRENT_USER_ID = "usr_hamza";
