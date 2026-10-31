import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";

const statusTones: Record<LeadStatus, StatusTone> = {
  new: "info",
  contacted: "neutral",
  qualified: "violet",
  site_visit: "brand",
  negotiation: "warning",
  won: "success",
  lost: "danger",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <StatusBadge tone={statusTones[status]}>{LEAD_STATUS_LABELS[status]}</StatusBadge>;
}
