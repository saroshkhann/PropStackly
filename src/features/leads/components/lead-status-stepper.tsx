"use client";

import { Check } from "lucide-react";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";
import { cn } from "@/lib/utils";

const steps: LeadStatus[] = ["new", "contacted", "qualified", "site_visit", "negotiation", "won"];

/** Progress through the lead lifecycle; each step is a button that moves the lead there. */
export function LeadStatusStepper({ status, onChange }: { status: LeadStatus; onChange: (status: LeadStatus) => void }) {
  const lost = status === "lost";
  const currentIndex = lost ? -1 : steps.indexOf(status);

  return (
    <ol aria-label="Lead progress" className="scrollbar-thin flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const done = !lost && index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step} className="flex min-w-[96px] flex-1 items-center">
            <button
              type="button"
              onClick={() => onChange(step)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "group flex w-full flex-col gap-1.5 rounded-lg px-1 py-1 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-full rounded-full bg-muted transition-colors group-hover:bg-border-strong",
                  done && "bg-brand/70 group-hover:bg-brand/80",
                  current && (step === "won" ? "bg-success" : "bg-brand"),
                )}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground",
                  (done || current) && "text-foreground",
                  current && "font-semibold",
                )}
              >
                {done && <Check className="size-3 text-brand" aria-hidden />}
                {LEAD_STATUS_LABELS[step]}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
