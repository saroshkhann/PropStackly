"use client";

import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  primary: string;
  secondary?: string;
  tooltip: React.ReactNode;
}

/** Single-series magnitude bars rendered in HTML for crisp labels; the row is the hover target. */
export function HorizontalBarList({ items, ariaLabel }: { items: BarListItem[]; ariaLabel: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul aria-label={ariaLabel} className="flex flex-col gap-1">
      {items.map((item, index) => (
        <li key={item.key}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                tabIndex={0}
                className="group/bar -mx-2 rounded-lg px-2 py-1.5 transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="truncate text-secondary-foreground">{item.label}</span>
                  <span className="shrink-0 tabular">
                    <span className="font-semibold text-foreground">{item.primary}</span>
                    {item.secondary && <span className="ml-1.5 text-muted-foreground">{item.secondary}</span>}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-chart-1 transition-[filter] group-hover/bar:brightness-110"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">{item.tooltip}</TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}
