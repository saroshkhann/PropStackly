"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LOST_REASONS } from "@/domain/deal";
import { cn } from "@/lib/utils";

interface LostReasonDialogProps {
  open: boolean;
  dealTitle: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** Moving a deal to Closed lost always asks why, so win/loss reporting stays meaningful. */
export function LostReasonDialog({ open, dealTitle, onCancel, onConfirm }: LostReasonDialogProps) {
  const [reason, setReason] = useState<string>(LOST_REASONS[0]);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark deal as lost</DialogTitle>
          <DialogDescription>{dealTitle}. Why didn&apos;t it close?</DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={setReason} aria-label="Lost reason" className="gap-2">
          {LOST_REASONS.map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-colors hover:bg-muted/60",
                reason === option && "border-danger/40 bg-danger-soft/60",
              )}
            >
              <RadioGroupItem value={option} />
              {option}
            </label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Keep open
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)}>
            Mark as lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
