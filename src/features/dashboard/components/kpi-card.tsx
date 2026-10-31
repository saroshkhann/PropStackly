import type { LucideIcon } from "lucide-react";
import { DeltaIndicator } from "@/components/shared/delta-indicator";
import { Sparkline } from "@/components/charts/sparkline";

export interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  delta?: number;
  comparison: string;
  footnote: React.ReactNode;
  trend: number[];
}

export function KpiCard({ label, value, unit, icon: Icon, delta, comparison, footnote, trend }: KpiCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-shadow duration-200 hover:shadow-raised">
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
              <Icon className="size-[15px]" aria-hidden />
            </span>
            <h3 className="truncate text-[13px] font-medium text-muted-foreground">{label}</h3>
          </div>
          {delta !== undefined && <DeltaIndicator value={delta} />}
        </div>
        <p className="mt-3.5 flex items-baseline gap-1.5 text-[28px] leading-none font-semibold tracking-[-0.025em] text-foreground tabular">
          {unit && <span className="text-sm font-medium tracking-normal text-muted-foreground">{unit}</span>}
          {value}
        </p>
        <p className="mt-2 truncate text-xs text-muted-foreground">{comparison}</p>
      </div>
      <Sparkline data={trend} className="mt-2 h-11 w-full opacity-90 transition-opacity group-hover:opacity-100" />
      <p className="border-t px-5 py-3 text-xs text-muted-foreground">{footnote}</p>
    </article>
  );
}
