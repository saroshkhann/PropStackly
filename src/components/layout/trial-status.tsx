"use client";

import { useState } from "react";
import { Hourglass, Lock, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { TrialStatus } from "@/domain/subscription";
import { notifyDemoAction } from "@/lib/demo";
import { formatDate, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

function TrialMeter({ fraction, className }: { fraction: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label="Trial time used"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      className={cn("h-1.5 overflow-hidden rounded-full bg-warning/15", className)}
    >
      <div className="h-full rounded-full bg-warning" style={{ width: `${Math.max(4, fraction * 100)}%` }} />
    </div>
  );
}

const activatePlan = () =>
  notifyDemoAction("Activate subscription", "Billing is simulated. Payments will be approved manually by the platform admin in a later batch.");

export function TrialBanner({ trial }: { trial: TrialStatus }) {
  const [dismissed, setDismissed] = useState(false);
  const expired = trial.state === "expired";
  const endsAt = `${formatDate(trial.endsAt, "weekday")}, ${formatDate(trial.endsAt, "time")} PKT`;

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div
            role="status"
            className="flex flex-col gap-3 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-warning shadow-card ring-1 ring-warning/20">
                {expired ? <Lock className="size-4" aria-hidden /> : <Hourglass className="size-4" aria-hidden />}
              </span>
              <div className="min-w-0 text-sm">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-foreground">
                  {expired ? "Your free trial has ended" : `Free trial · ${formatDuration(trial.remainingMs)} remaining`}
                  <span className="rounded-full border border-dashed border-warning/40 px-1.5 py-px text-[10.5px] font-medium text-warning">
                    Simulated
                  </span>
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {expired
                    ? "Your workspace is read-only. Activate a plan to resume adding and editing records."
                    : `Ends ${endsAt}. Afterwards the workspace becomes read-only until a plan is activated.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:shrink-0">
              {!expired && <TrialMeter fraction={trial.fractionUsed} className="w-24 max-sm:flex-1" />}
              <Button size="sm" onClick={activatePlan}>
                Activate plan
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:bg-warning/10"
                onClick={() => setDismissed(true)}
                aria-label="Hide trial banner"
              >
                <X />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SidebarTrialCard({ trial, className }: { trial: TrialStatus; className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-3 shadow-card", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">Free trial</span>
        <span className="text-muted-foreground tabular">
          {trial.state === "expired" ? "Ended" : `${formatDuration(trial.remainingMs)} left`}
        </span>
      </div>
      <TrialMeter fraction={trial.fractionUsed} className="mt-2" />
      <button
        type="button"
        onClick={activatePlan}
        className="mt-2.5 text-xs font-medium text-brand underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
      >
        View plans
      </button>
    </div>
  );
}
