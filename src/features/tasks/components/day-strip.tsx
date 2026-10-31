"use client";

import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DayStripProps {
  days: { key: string; iso: string; open: number; high: number }[];
  selected: string | null;
  onSelect: (day: string | null) => void;
}

/** The coming week at a glance; picking a day narrows the agenda to it. */
export function DayStrip({ days, selected, onSelect }: DayStripProps) {
  return (
    <div role="group" aria-label="Filter by day" className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {days.map((day, index) => {
        const active = selected === day.key;
        return (
          <button
            key={day.key}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? null : day.key)}
            className={cn(
              "flex min-w-[84px] flex-1 flex-col items-start rounded-xl border bg-card px-3 py-2.5 text-left shadow-card transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active && "border-primary bg-primary text-primary-foreground hover:border-primary",
            )}
          >
            <span className={cn("text-[11px] font-medium text-muted-foreground", active && "text-primary-foreground/75")}>
              {index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDate(day.iso, "weekday").split(" ")[0]}
            </span>
            <span className="text-sm font-semibold tabular">{formatDate(day.iso, "dayMonth")}</span>
            <span className={cn("mt-1 text-xs text-muted-foreground tabular", active && "text-primary-foreground/80")}>
              {day.open} open
              {day.high > 0 && <span className={cn("ml-1 font-semibold text-danger", active && "text-primary-foreground")}>· {day.high} high</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
