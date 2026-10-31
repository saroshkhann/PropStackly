import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: React.ReactNode;
  tone?: "default" | "attention";
}

/** Compact KPI tile for module overviews; the dashboard uses the richer KpiCard with trends. */
export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: StatCardProps) {
  return (
    <article className="flex items-start gap-3.5 rounded-xl border bg-card p-4 shadow-card">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground max-sm:hidden",
          tone === "attention" && "border-warning/25 bg-warning-soft text-warning",
        )}
      >
        <Icon className="size-[17px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[13px] font-medium text-muted-foreground">{label}</h3>
        <p className="mt-1 text-[19px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-foreground tabular sm:text-[22px]">{value}</p>
        {hint && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground sm:truncate">{hint}</p>}
      </div>
    </article>
  );
}
