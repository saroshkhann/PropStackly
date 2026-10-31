import { Flame, Snowflake, Thermometer, type LucideIcon } from "lucide-react";
import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { LEAD_PRIORITY_LABELS, LEAD_STATUS_LABELS, type LeadPriority, type LeadStatus } from "@/domain/lead";
import { cn } from "@/lib/utils";

export const leadStatusTones: Record<LeadStatus, StatusTone> = {
  new: "info",
  contacted: "neutral",
  qualified: "violet",
  site_visit: "brand",
  negotiation: "warning",
  won: "success",
  lost: "danger",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <StatusBadge tone={leadStatusTones[status]}>{LEAD_STATUS_LABELS[status]}</StatusBadge>;
}

export const priorityMeta: Record<LeadPriority, { icon: LucideIcon; className: string }> = {
  hot: { icon: Flame, className: "text-danger" },
  warm: { icon: Thermometer, className: "text-warning" },
  cold: { icon: Snowflake, className: "text-info" },
};

export function LeadPriorityBadge({ priority, className }: { priority: LeadPriority; className?: string }) {
  const { icon: Icon, className: tone } = priorityMeta[priority];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px] font-medium text-secondary-foreground", className)}>
      <Icon className={cn("size-3.5", tone)} aria-hidden />
      {LEAD_PRIORITY_LABELS[priority]}
    </span>
  );
}
