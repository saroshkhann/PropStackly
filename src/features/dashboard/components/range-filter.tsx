"use client";

import { cn } from "@/lib/utils";
import { RANGE_OPTIONS, type RangeKey } from "../lib/metrics";

export function RangeFilter({ value, onChange }: { value: RangeKey; onChange: (value: RangeKey) => void }) {
  return (
    <div role="group" aria-label="Date range" className="inline-flex h-8 items-center rounded-lg border bg-card p-0.5 shadow-card">
      {RANGE_OPTIONS.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={cn(
              "h-full rounded-md px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
