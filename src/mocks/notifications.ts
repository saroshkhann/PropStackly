import type { AppNotification } from "@/domain/notification";
import { DEMO_AGENCY_ID } from "./agency";
import { hoursFromNow } from "./utils";

const seeds: Omit<AppNotification, "agencyId">[] = [
  { id: "ntf_1", kind: "lead_assigned", title: "New lead from Zameen.com", body: "Kashif Mehmood · 1 Kanal house, DHA Phase 6 — assigned to Bilal Ahmed", createdAt: hoursFromNow(-0.6), read: false },
  { id: "ntf_2", kind: "site_visit", title: "Site visit in 2 hours", body: "Maryam Zafar · Street 12, DHA Phase 5", createdAt: hoursFromNow(-0.3), read: false },
  { id: "ntf_3", kind: "deal_update", title: "Token received", body: "Asad Mirza paid bayana for 8 Marla house, Bahria Town", createdAt: hoursFromNow(-14), read: false },
  { id: "ntf_4", kind: "task_due", title: "3 follow-ups overdue", body: "Review pending follow-ups for Johar Town leads", createdAt: hoursFromNow(-20), read: true },
  { id: "ntf_5", kind: "trial", title: "Your free trial is active", body: "72 hours to explore PropStackly with your team", createdAt: hoursFromNow(-22), read: true },
];

export const demoNotifications: AppNotification[] = seeds.map((n) => ({ ...n, agencyId: DEMO_AGENCY_ID }));
