"use client";

import Link from "next/link";
import { ArrowUpRight, Pencil, Trophy, UserRoundCog, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AgentChip } from "@/components/shared/agent-chip";
import { AgentPicker } from "@/components/shared/agent-picker";
import { DetailList } from "@/components/shared/detail-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import { isOpenStage, type PipelineStage, type PipelineStageId } from "@/domain/deal";
import { PropertyImageView } from "@/features/properties/components/property-image";
import type { AgentOption } from "@/features/workspace/types";
import { formatDate, formatPKR, formatPKRCompact, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealItem } from "../data/types";
import { dealProbability } from "../lib/pipeline";
import { stageAccent } from "./stage-meta";

interface DealDetailsSheetProps {
  deal: DealItem | null;
  stages: PipelineStage[];
  agents: AgentOption[];
  now: string;
  onClose: () => void;
  onMove: (deal: DealItem, stageId: PipelineStageId) => void;
  onAssign: (deal: DealItem, agentId: string | null) => void;
  onEdit: (deal: DealItem) => void;
}

export function DealDetailsSheet({ deal, stages, agents, now, onClose, onMove, onAssign, onEdit }: DealDetailsSheetProps) {
  return (
    <Sheet open={deal !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:w-full sm:max-w-md">
        {deal && <DealDetailsBody deal={deal} stages={stages} agents={agents} now={now} onMove={onMove} onAssign={onAssign} onEdit={onEdit} />}
      </SheetContent>
    </Sheet>
  );
}

function DealDetailsBody({ deal, stages, agents, now, onMove, onAssign, onEdit }: Omit<DealDetailsSheetProps, "deal" | "onClose"> & { deal: DealItem }) {
  const stage = stages.find((s) => s.id === deal.stageId);
  const probability = dealProbability(deal, stages);
  const open = isOpenStage(deal.stageId);
  const openStages = stages.filter((s) => s.outcome === "open");
  const stageIndex = openStages.findIndex((s) => s.id === deal.stageId);

  return (
    <>
      <SheetHeader className="gap-3 border-b px-6 py-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: stageAccent[deal.stageId] }} aria-hidden />
          {stage?.label}
          {(deal.isDraft || deal.hasLocalEdits) && (
            <span className="rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] text-warning">{deal.isDraft ? "Draft" : "Unsaved change"}</span>
          )}
        </div>
        <SheetTitle className="pr-6 text-lg leading-snug">{deal.title}</SheetTitle>
        <SheetDescription className="sr-only">Deal details</SheetDescription>
        <div>
          <p className="text-[26px] leading-none font-semibold tracking-[-0.02em] tabular">
            <span className="mr-1.5 text-sm font-medium tracking-normal text-muted-foreground">PKR</span>
            {formatPKRCompact(deal.valuePKR, { prefix: false })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground tabular">
            {formatPKR(deal.valuePKR)}
            {deal.purpose === "rent" ? " annual lease" : ""}
            {open && ` · ${Math.round(probability * 100)}% likely · ${formatPKRCompact(deal.valuePKR * probability)} weighted`}
          </p>
        </div>
        {open && (
          <ol className="flex gap-1" aria-label="Stage progress">
            {openStages.map((s, i) => (
              <li key={s.id} className={cn("h-1.5 flex-1 rounded-full bg-muted", i <= stageIndex && "bg-brand")} title={s.label}>
                <span className="sr-only">
                  {s.label}
                  {i === stageIndex ? " (current)" : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </SheetHeader>

      <div className="scrollbar-thin flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        {deal.stageId === "closed_won" && (
          <p className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-3 py-2.5 text-[13px] font-medium text-success">
            <Trophy className="size-4" aria-hidden />
            Won {deal.closedAt ? `on ${formatDate(deal.closedAt, "dayMonth")}` : ""}
          </p>
        )}
        {deal.stageId === "closed_lost" && (
          <p className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
            <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-medium">Lost {deal.closedAt ? `on ${formatDate(deal.closedAt, "dayMonth")}` : ""}</span>
              {deal.lostReason && <span className="block text-xs">{deal.lostReason}</span>}
            </span>
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="deal-stage-select" className="text-xs font-medium text-muted-foreground">
            Stage
          </label>
          <Select value={deal.stageId} onValueChange={(value) => onMove(deal, value as PipelineStageId)}>
            <SelectTrigger id="deal-stage-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {stages.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="size-2 rounded-full" style={{ backgroundColor: stageAccent[s.id] }} aria-hidden />
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <section aria-label="Customer" className="flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground">Customer</h3>
          <div className="flex items-center gap-3">
            <UserAvatar name={deal.customerName} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{deal.customerName}</p>
              <p className="text-xs text-muted-foreground tabular">{deal.customerPhoneMasked ?? "Prospect from portal inquiry"}</p>
            </div>
            {deal.leadId && (
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href={`/leads/${deal.leadId}`}>
                  Lead
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            )}
          </div>
        </section>

        <section aria-label="Property" className="flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground">Property</h3>
          {deal.property ? (
            <Link
              href={`/properties/${deal.property.id}`}
              className="group flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <PropertyImageView image={deal.property.cover} className="size-14 shrink-0 rounded-md" showMarker={false} sizes="56px" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium group-hover:underline group-hover:underline-offset-4">{deal.property.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {deal.property.location} · listed at {formatPKRCompact(deal.property.pricePKR)}
                  {deal.property.purpose === "rent" ? "/mo" : ""}
                </span>
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          ) : (
            <p className="text-[13px] text-muted-foreground">No property linked yet.</p>
          )}
        </section>

        <section aria-label="Agent" className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-medium text-muted-foreground">Assigned agent</h3>
            <AgentChip name={deal.owner?.name ?? null} />
          </div>
          <AgentPicker agents={agents} value={deal.ownerId} onChange={(agentId) => onAssign(deal, agentId)} align="end">
            <Button variant="outline" size="sm">
              <UserRoundCog />
              Reassign
            </Button>
          </AgentPicker>
        </section>

        <DetailList
          items={[
            { label: "Expected close", value: deal.expectedCloseAt ? formatDate(deal.expectedCloseAt, "weekday") : "Not set" },
            { label: "Created", value: formatRelative(deal.createdAt, now) },
            { label: "Last updated", value: formatRelative(deal.updatedAt, now) },
          ]}
        />

        {deal.notes && (
          <section aria-label="Notes">
            <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</h3>
            <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-[13px] leading-relaxed text-secondary-foreground">{deal.notes}</p>
          </section>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t px-6 py-4">
        <Button variant="outline" onClick={() => onEdit(deal)}>
          <Pencil />
          Edit
        </Button>
        {open && (
          <>
            <Button variant="outline" className="text-success hover:text-success" onClick={() => onMove(deal, "closed_won")}>
              <Trophy />
              Mark won
            </Button>
            <Button variant="outline" className="text-danger hover:text-danger" onClick={() => onMove(deal, "closed_lost")}>
              <XCircle />
              Mark lost
            </Button>
          </>
        )}
      </div>
    </>
  );
}
