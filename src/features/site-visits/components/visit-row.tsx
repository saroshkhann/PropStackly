"use client";

import { AlertCircle, Clock, MapPin } from "lucide-react";
import { AgentChip } from "@/components/shared/agent-chip";
import { PropertyImageView } from "@/features/properties/components/property-image";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VisitItem } from "../data/types";
import { needsOutcome } from "../lib/visits";
import { VisitOutcomeBadge, VisitStatusBadge } from "./visit-badges";

export function VisitRow({ visit, now, onOpen, showDate = true }: { visit: VisitItem; now: string; onOpen: (visit: VisitItem) => void; showDate?: boolean }) {
  const pending = needsOutcome(visit, now);
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(visit)}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none sm:px-5",
          visit.status === "cancelled" && "opacity-70",
        )}
      >
        <div className="w-16 shrink-0 pt-0.5 text-right sm:w-20">
          {showDate && <p className="text-xs font-medium text-muted-foreground">{formatDate(visit.startsAt, "weekday").replace(/^\w+ /, "")}</p>}
          <p className="text-[13px] font-semibold tabular">{formatDate(visit.startsAt, "time")}</p>
        </div>
        <PropertyImageView image={visit.property?.cover} className="size-11 shrink-0 rounded-lg max-sm:hidden" showMarker={false} sizes="44px" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
            <span className="truncate">{visit.customerName}</span>
            {visit.priority === "high" && <span className="rounded-md bg-danger-soft px-1.5 py-px text-[10.5px] font-semibold text-danger">High</span>}
            {(visit.isDraft || visit.hasLocalEdits) && (
              <span className="rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning">{visit.isDraft ? "Draft" : "Edited"}</span>
            )}
          </p>
          <p className="truncate text-xs text-secondary-foreground">{visit.property?.title ?? visit.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{visit.meetingPoint}</span>
            </span>
            <span className="flex items-center gap-1 tabular">
              <Clock className="size-3" aria-hidden />
              {visit.durationMinutes} min
            </span>
            {pending && (
              <span className="flex items-center gap-1 font-medium text-warning">
                <AlertCircle className="size-3" aria-hidden />
                Log outcome · {formatRelative(visit.startsAt, now)}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <VisitStatusBadge status={visit.status} />
          {visit.outcome && <VisitOutcomeBadge outcome={visit.outcome} />}
          <AgentChip name={visit.agent?.name ?? null} short className="text-xs max-md:hidden" />
        </div>
      </button>
    </li>
  );
}
