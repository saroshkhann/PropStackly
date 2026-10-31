import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "brand" | "success" | "warning" | "danger" | "violet";

const toneClasses: Record<StatusTone, { badge: string; dot: string }> = {
  neutral: { badge: "bg-muted text-secondary-foreground ring-border", dot: "bg-subtle-foreground" },
  info: { badge: "bg-info-soft text-info ring-info/15", dot: "bg-info" },
  brand: { badge: "bg-brand-soft text-brand ring-brand/15", dot: "bg-brand" },
  success: { badge: "bg-success-soft text-success ring-success/15", dot: "bg-success" },
  warning: { badge: "bg-warning-soft text-warning ring-warning/20", dot: "bg-warning" },
  danger: { badge: "bg-danger-soft text-danger ring-danger/15", dot: "bg-danger" },
  violet: { badge: "bg-[oklch(0.96_0.025_295)] text-[oklch(0.48_0.15_295)] ring-[oklch(0.48_0.15_295)]/15", dot: "bg-[oklch(0.55_0.17_295)]" },
};

export function StatusBadge({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  const classes = toneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        classes.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", classes.dot)} aria-hidden />
      {children}
    </span>
  );
}
