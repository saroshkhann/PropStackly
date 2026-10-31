import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { VISIT_OUTCOME_LABELS, VISIT_STATUS_LABELS, type VisitOutcome, type VisitStatus } from "@/domain/site-visit";

export const visitStatusTones: Record<VisitStatus, StatusTone> = {
  scheduled: "info",
  confirmed: "brand",
  completed: "success",
  cancelled: "neutral",
  no_show: "danger",
};

export const visitOutcomeTones: Record<VisitOutcome, StatusTone> = {
  offer_made: "success",
  very_interested: "success",
  interested: "brand",
  needs_time: "warning",
  not_interested: "neutral",
};

/** Dot colours for calendar chips, matching the status badge tones. */
export const visitStatusDot: Record<VisitStatus, string> = {
  scheduled: "bg-info",
  confirmed: "bg-brand",
  completed: "bg-success",
  cancelled: "bg-subtle-foreground",
  no_show: "bg-danger",
};

export function VisitStatusBadge({ status, className }: { status: VisitStatus; className?: string }) {
  return (
    <StatusBadge tone={visitStatusTones[status]} className={className}>
      {VISIT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}

export function VisitOutcomeBadge({ outcome }: { outcome: VisitOutcome }) {
  return (
    <StatusBadge tone={visitOutcomeTones[outcome]} className="h-5 px-2 text-[11px]">
      {VISIT_OUTCOME_LABELS[outcome]}
    </StatusBadge>
  );
}
