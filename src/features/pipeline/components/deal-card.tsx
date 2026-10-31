"use client";

import { CalendarClock, Ellipsis, GripVertical, Home, Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentChip } from "@/components/shared/agent-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { PipelineStage, PipelineStageId } from "@/domain/deal";
import { PropertyImageView } from "@/features/properties/components/property-image";
import { formatDate, formatPKRCompact, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealItem } from "../data/types";
import type { BoardSettings } from "../lib/pipeline";

interface DealCardProps {
  deal: DealItem;
  stages: PipelineStage[];
  settings: BoardSettings;
  now: string;
  onOpen: (deal: DealItem) => void;
  onMove: (deal: DealItem, stageId: PipelineStageId) => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: (deal: DealItem) => void;
  onDragEnd?: () => void;
}

export function DealCard({ deal, stages, settings, now, onOpen, onMove, draggable = false, dragging, onDragStart, onDragEnd }: DealCardProps) {
  const compact = settings.density === "compact";
  const won = deal.stageId === "closed_won";
  const lost = deal.stageId === "closed_lost";
  const closeOverdue = !won && !lost && deal.expectedCloseAt !== null && new Date(deal.expectedCloseAt).getTime() < new Date(now).getTime();

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", deal.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(deal);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group/deal relative rounded-lg border bg-card shadow-card transition-[box-shadow,opacity,transform] duration-150 hover:shadow-raised",
        draggable && "cursor-grab active:cursor-grabbing",
        dragging && "rotate-1 opacity-50",
        won && "border-success/30",
        lost && "border-danger/25 bg-card/70",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(deal)}
        className={cn("block w-full rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", compact ? "p-3" : "p-3.5")}
        aria-label={`${deal.title}, ${deal.customerName}, ${formatPKRCompact(deal.valuePKR)}. Open details`}
      >
        <div className="flex items-start gap-2 pr-6">
          {draggable && <GripVertical className="mt-0.5 -ml-1 size-3.5 shrink-0 text-subtle-foreground opacity-0 transition-opacity group-hover/deal:opacity-100" aria-hidden />}
          <p className={cn("line-clamp-2 text-[13px] leading-snug font-medium text-foreground", lost && "text-muted-foreground")}>{deal.title}</p>
        </div>
        <p className={cn("mt-1.5 text-[15px] font-semibold tracking-[-0.01em] tabular", lost && "text-muted-foreground line-through decoration-1")}>
          <span className="mr-1 text-[11px] font-medium text-muted-foreground no-underline">PKR</span>
          {formatPKRCompact(deal.valuePKR, { prefix: false })}
          {deal.purpose === "rent" && <span className="ml-1 text-[11px] font-medium text-muted-foreground">/yr lease</span>}
        </p>

        {(won || lost) && (
          <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium", won ? "text-success" : "text-danger")}>
            {won ? <Trophy className="size-3.5" aria-hidden /> : <XCircle className="size-3.5" aria-hidden />}
            {won ? "Won" : "Lost"}
            {deal.closedAt && ` · ${formatDate(deal.closedAt, "dayMonth")}`}
            {lost && deal.lostReason && <span className="truncate font-normal text-muted-foreground">· {deal.lostReason}</span>}
          </p>
        )}

        {settings.fields.customer && (
          <p className="mt-2.5 flex items-center gap-2 text-xs text-secondary-foreground">
            <UserAvatar name={deal.customerName} size="xs" />
            <span className="truncate">{deal.customerName}</span>
          </p>
        )}

        {settings.fields.property && deal.property && (
          <div className="mt-2 flex items-center gap-2">
            {compact ? (
              <Home className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
            ) : (
              <PropertyImageView image={deal.property.cover} className="size-8 shrink-0 rounded-md" showMarker={false} sizes="32px" />
            )}
            <span className="min-w-0 text-xs">
              <span className="block truncate text-secondary-foreground">{deal.property.title}</span>
              {!compact && <span className="block truncate text-muted-foreground">{deal.property.location}</span>}
            </span>
          </div>
        )}

        {(settings.fields.agent || (settings.fields.closeDate && deal.expectedCloseAt && !won && !lost)) && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t pt-2.5 text-xs">
            {settings.fields.agent ? <AgentChip name={deal.owner?.name ?? null} short /> : <span />}
            {settings.fields.closeDate && deal.expectedCloseAt && !won && !lost && (
              <span className={cn("flex items-center gap-1 text-muted-foreground tabular", closeOverdue && "font-medium text-danger")}>
                <CalendarClock className="size-3" aria-hidden />
                {closeOverdue ? `Overdue ${formatRelative(deal.expectedCloseAt, now).replace(" ago", "")}` : `Closes ${formatRelative(deal.expectedCloseAt, now)}`}
              </span>
            )}
          </div>
        )}
        {(deal.isDraft || deal.hasLocalEdits) && (
          <span className="mt-2 inline-flex rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning">
            {deal.isDraft ? "Draft" : "Unsaved change"}
          </span>
        )}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-2.5 right-2 text-muted-foreground opacity-60 group-hover/deal:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
            aria-label={`Move or edit ${deal.title}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => onOpen(deal)}>Open details</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Move to</DropdownMenuLabel>
          {stages
            .filter((stage) => stage.id !== deal.stageId)
            .map((stage) => (
              <DropdownMenuItem key={stage.id} onSelect={() => onMove(deal, stage.id)}>
                {stage.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}
