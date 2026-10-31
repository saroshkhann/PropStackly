"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, CheckCircle2, Clock, MapPin, Pencil, UserX, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { AgentChip } from "@/components/shared/agent-chip";
import { ContactActions } from "@/components/shared/contact-actions";
import { VISIT_OUTCOMES, VISIT_OUTCOME_LABELS, type VisitOutcome, type VisitStatus } from "@/domain/site-visit";
import { LeadPeek } from "@/features/leads/components/lead-peek";
import { PropertyImageView } from "@/features/properties/components/property-image";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VisitItem } from "../data/types";
import { needsOutcome } from "../lib/visits";
import { VisitOutcomeBadge, VisitStatusBadge } from "./visit-badges";

interface VisitDetailsSheetProps {
  visit: VisitItem | null;
  now: string;
  onClose: () => void;
  onStatus: (visit: VisitItem, status: VisitStatus) => void;
  onOutcome: (visit: VisitItem, outcome: VisitOutcome, notes: string) => void;
  onEdit: (visit: VisitItem) => void;
}

export function VisitDetailsSheet(props: VisitDetailsSheetProps) {
  return (
    <Sheet open={props.visit !== null} onOpenChange={(open) => !open && props.onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:w-full sm:max-w-md">
        {props.visit && <VisitDetailsBody key={`${props.visit.id}-${props.visit.status}`} {...props} visit={props.visit} />}
      </SheetContent>
    </Sheet>
  );
}

function VisitDetailsBody({ visit, now, onStatus, onOutcome, onEdit }: VisitDetailsSheetProps & { visit: VisitItem }) {
  const [outcome, setOutcome] = useState<VisitOutcome | null>(visit.outcome);
  const [notes, setNotes] = useState(visit.notes ?? "");
  const [logging, setLogging] = useState(visit.status === "completed" && !visit.outcome);
  const open = visit.status === "scheduled" || visit.status === "confirmed";
  const pending = needsOutcome(visit, now);
  const started = new Date(visit.startsAt).getTime() <= new Date(now).getTime();
  const notesError = notes.length > 1000 ? "Keep notes under 1,000 characters" : null;

  return (
    <>
      <SheetHeader className="gap-3 border-b px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <VisitStatusBadge status={visit.status} />
          {visit.outcome && <VisitOutcomeBadge outcome={visit.outcome} />}
          {(visit.isDraft || visit.hasLocalEdits) && (
            <span className="rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning">{visit.isDraft ? "Draft" : "Unsaved change"}</span>
          )}
        </div>
        <SheetTitle className="pr-6 text-lg leading-snug">Site visit with {visit.customerName}</SheetTitle>
        <SheetDescription className="flex flex-col gap-1 text-[13px]">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5" aria-hidden />
            {formatDate(visit.startsAt, "full")} · {formatDate(visit.startsAt, "time")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {visit.durationMinutes} minutes · {formatRelative(visit.startsAt, now)}
          </span>
        </SheetDescription>
      </SheetHeader>

      <div className="scrollbar-thin flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        {pending && (
          <p className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-2.5 text-[13px] text-warning">
            This visit has passed. Log how it went so the lead&apos;s next step is clear.
          </p>
        )}

        <section aria-label="Property" className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">Property</h3>
          {visit.property ? (
            <Link
              href={`/properties/${visit.property.id}`}
              className="group flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <PropertyImageView image={visit.property.cover} className="size-14 shrink-0 rounded-md" showMarker={false} sizes="56px" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium group-hover:underline group-hover:underline-offset-4">{visit.property.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{visit.property.location}</span>
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          ) : (
            <p className="text-[13px] text-muted-foreground">No property linked.</p>
          )}
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Meet at: {visit.meetingPoint}
          </p>
        </section>

        <section aria-label="Customer" className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">Customer</h3>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {visit.lead ? <LeadPeek lead={visit.lead} /> : <span className="text-[13px]">{visit.customerName}</span>}
            <span className="text-xs text-muted-foreground tabular">{visit.customerPhoneMasked}</span>
          </div>
          <ContactActions phoneMasked={visit.customerPhoneMasked} hasWhatsApp email={null} size="sm" />
        </section>

        <section aria-label="Agent" className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">Assigned agent</h3>
          <AgentChip name={visit.agent?.name ?? null} />
        </section>

        {(logging || visit.status === "completed") && (
          <section aria-label="Outcome" className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold">Outcome</h3>
            <div role="radiogroup" aria-label="Visit outcome" className="flex flex-wrap gap-1.5">
              {VISIT_OUTCOMES.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={outcome === option}
                  onClick={() => setOutcome(option)}
                  className={cn(
                    "h-8 rounded-full border bg-card px-3 text-[13px] text-secondary-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    outcome === option && "border-primary bg-brand-soft font-medium text-brand hover:bg-brand-soft",
                  )}
                >
                  {VISIT_OUTCOME_LABELS[option]}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="visit-notes" className="text-xs text-muted-foreground">
                Notes
              </Label>
              <Textarea
                id="visit-notes"
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What did the client like or object to? Any offer or next step?"
                aria-invalid={notesError ? true : undefined}
                aria-describedby={notesError ? "visit-notes-error" : undefined}
              />
              {notesError && (
                <p id="visit-notes-error" role="alert" className="text-xs font-medium text-danger">
                  {notesError}
                </p>
              )}
            </div>
            <Button disabled={!outcome || Boolean(notesError)} onClick={() => outcome && onOutcome(visit, outcome, notes.trim())}>
              <CheckCircle2 />
              {visit.status === "completed" ? "Update outcome" : "Mark completed"}
            </Button>
          </section>
        )}

        {visit.status !== "completed" && !logging && visit.notes && (
          <section aria-label="Notes">
            <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</h3>
            <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-[13px] leading-relaxed text-secondary-foreground">{visit.notes}</p>
          </section>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t px-6 py-4">
        {open && started && !logging && (
          <Button onClick={() => setLogging(true)}>
            <CheckCircle2 />
            Log outcome
          </Button>
        )}
        {visit.status === "scheduled" && (
          <Button variant="outline" onClick={() => onStatus(visit, "confirmed")}>
            Confirm
          </Button>
        )}
        <Button variant="outline" onClick={() => onEdit(visit)}>
          <Pencil />
          {open ? "Reschedule" : "Edit"}
        </Button>
        {open && (
          <>
            <Button variant="ghost" className="text-danger hover:text-danger" onClick={() => onStatus(visit, "no_show")}>
              <UserX />
              No-show
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => onStatus(visit, "cancelled")}>
              <XCircle />
              Cancel
            </Button>
          </>
        )}
      </div>
    </>
  );
}
