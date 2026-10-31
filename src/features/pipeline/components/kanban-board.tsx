"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import type { PipelineStage, PipelineStageId } from "@/domain/deal";
import { formatPKRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealItem } from "../data/types";
import { sortDeals, type BoardSettings } from "../lib/pipeline";
import { DealCard } from "./deal-card";
import { stageAccent } from "./stage-meta";

interface KanbanBoardProps {
  stages: PipelineStage[];
  deals: DealItem[];
  settings: BoardSettings;
  now: string;
  onOpen: (deal: DealItem) => void;
  onMove: (deal: DealItem, stageId: PipelineStageId) => void;
}

/** Desktop board with native drag-and-drop; every move is also available from each card's menu. */
export function KanbanBoard({ stages, deals, settings, now, onOpen, onMove }: KanbanBoardProps) {
  const [dragging, setDragging] = useState<DealItem | null>(null);
  const [overStage, setOverStage] = useState<PipelineStageId | null>(null);
  const visibleStages = stages.filter((stage) => !settings.hiddenStages.includes(stage.id));

  return (
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <ol className="flex min-w-max items-start gap-3" aria-label="Pipeline stages">
        {visibleStages.map((stage) => {
          const stageDeals = sortDeals(deals.filter((deal) => deal.stageId === stage.id), settings.sort);
          const total = stageDeals.reduce((sum, deal) => sum + deal.valuePKR, 0);
          const isTarget = overStage === stage.id && dragging?.stageId !== stage.id;
          return (
            <li
              key={stage.id}
              aria-label={`${stage.label}, ${stageDeals.length} deals`}
              onDragOver={(event) => {
                if (!dragging) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverStage(stage.id);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverStage(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const deal = deals.find((d) => d.id === event.dataTransfer.getData("text/plain"));
                setOverStage(null);
                setDragging(null);
                if (deal && deal.stageId !== stage.id) onMove(deal, stage.id);
              }}
              className={cn(
                "flex w-[284px] shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors",
                isTarget && "border-brand/50 bg-brand-soft/70 ring-2 ring-brand/20",
              )}
            >
              <header className="rounded-t-xl border-b px-3 pt-3 pb-2.5">
                <span className="mb-2.5 block h-1 rounded-full" style={{ backgroundColor: stageAccent[stage.id] }} aria-hidden />
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-foreground">{stage.label}</h3>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground tabular shadow-card">{stageDeals.length}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground tabular">
                  {formatPKRCompact(total)}
                  {stage.outcome === "open" && <span> · {Math.round(stage.probability * 100)}% likely</span>}
                </p>
              </header>
              <div className={cn("flex min-h-24 flex-col p-2", settings.density === "compact" ? "gap-1.5" : "gap-2")}>
                {stageDeals.length === 0 ? (
                  <div className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground", isTarget && "border-brand/40 text-brand")}>
                    <Inbox className="size-4" aria-hidden />
                    {isTarget ? "Drop to move here" : "No deals"}
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      stages={stages}
                      settings={settings}
                      now={now}
                      onOpen={onOpen}
                      onMove={onMove}
                      draggable
                      dragging={dragging?.id === deal.id}
                      onDragStart={setDragging}
                      onDragEnd={() => {
                        setDragging(null);
                        setOverStage(null);
                      }}
                    />
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
