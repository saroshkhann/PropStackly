import type { TenantScoped } from "./tenancy";

export type VisitStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
export type VisitOutcome = "offer_made" | "very_interested" | "interested" | "needs_time" | "not_interested";

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const VISIT_OUTCOME_LABELS: Record<VisitOutcome, string> = {
  offer_made: "Offer made",
  very_interested: "Very interested",
  interested: "Interested",
  needs_time: "Needs time",
  not_interested: "Not interested",
};

export const VISIT_STATUSES = Object.keys(VISIT_STATUS_LABELS) as VisitStatus[];
export const VISIT_OUTCOMES = Object.keys(VISIT_OUTCOME_LABELS) as VisitOutcome[];

export interface SiteVisit extends TenantScoped {
  id: string;
  title: string;
  leadId: string | null;
  customerName: string;
  customerPhoneMasked: string;
  propertyId: string | null;
  /** Where the agent meets the client, e.g. the property gate or the office. */
  meetingPoint: string;
  startsAt: string;
  durationMinutes: number;
  assignedToId: string;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  notes: string | null;
  priority: "high" | "normal";
}
