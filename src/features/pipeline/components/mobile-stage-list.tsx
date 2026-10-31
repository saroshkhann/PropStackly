"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import type { PipelineStage, PipelineStageId } from "@/domain/deal";
import { formatPKRCompact } from "@/lib/format";
import type { DealItem } from "../data/types";
import { sortDeals, type BoardSettings } from "../lib/pipeline";
import { DealCard } from "./deal-card";
import { stageAccent } from "./stage-meta";

/** Phones get one stage at a time; cards move between stages from their menu instead of by dragging. */
export function MobileStageList({ stages, deals, settings, now, onOpen, onMove }: {
  stages: PipelineStage[];
  deals: DealItem[];
  settings: BoardSettings;
  now: string;
  onOpen: (deal: DealItem) => void;
  onMove: (deal: DealItem, stageId: PipelineStageId) => void;
}) {
  const visible = stages.filter((stage) => !settings.hiddenStages.includes(stage.id));
  const [stageId, setStageId] = useState<PipelineStageId>(visible[0]?.id ?? "inquiry");
  const stageDeals = sortDeals(deals.filter((deal) => deal.stageId === stageId), settings.sort);

  return (
    <div className="flex flex-col gap-3">
      <Select value={stageId} onValueChange={(value) => setStageId(value as PipelineStageId)}>
        <SelectTrigger aria-label="Pipeline stage" className="h-10 w-full bg-card shadow-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {visible.map((stage) => {
            const count = deals.filter((deal) => deal.stageId === stage.id).length;
            return (
              <SelectItem key={stage.id} value={stage.id}>
                <span className="size-2 rounded-full" style={{ backgroundColor: stageAccent[stage.id] }} aria-hidden />
                {stage.label}
                <span className="text-muted-foreground tabular">· {count}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground tabular">
        {stageDeals.length} deals · {formatPKRCompact(stageDeals.reduce((sum, d) => sum + d.valuePKR, 0))} · use a card&apos;s menu to move it
      </p>
      {stageDeals.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState icon={Inbox} title="No deals in this stage" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {stageDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} stages={stages} settings={settings} now={now} onOpen={onOpen} onMove={onMove} />
          ))}
        </div>
      )}
    </div>
  );
}
