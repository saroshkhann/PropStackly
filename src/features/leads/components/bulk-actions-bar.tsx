"use client";

import { ArrowRightLeft, Download, UserRoundCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";
import type { AgentOption } from "@/features/workspace/types";
import { notifyDemoAction } from "@/lib/demo";

interface BulkActionsBarProps {
  count: number;
  agents: AgentOption[];
  onAssign: (agentId: string | null) => void;
  onStatusChange: (status: LeadStatus) => void;
  onClear: () => void;
}

export function BulkActionsBar({ count, agents, onAssign, onStatusChange, onClear }: BulkActionsBarProps) {
  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:pl-[68px] lg:pl-[256px]">
      <div
        role="toolbar"
        aria-label={`Bulk actions for ${count} selected leads`}
        className="pointer-events-auto flex animate-in items-center gap-1 rounded-xl border bg-popover p-1.5 shadow-raised fade-in-0 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
      >
        <span className="px-2.5 text-[13px] font-medium whitespace-nowrap tabular" aria-live="polite">
          {count} selected
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <UserRoundCog />
              <span className="max-sm:sr-only">Assign</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Assign {count} leads to</DropdownMenuLabel>
            {agents.map((agent) => (
              <DropdownMenuItem key={agent.id} onSelect={() => onAssign(agent.id)}>
                {agent.name}
                <span className="ml-auto text-xs text-muted-foreground tabular">{agent.openLeads} open</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onAssign(null)}>Unassigned queue</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ArrowRightLeft />
              <span className="max-sm:sr-only">Status</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Move to</DropdownMenuLabel>
            {LEAD_STATUSES.map((status) => (
              <DropdownMenuItem key={status} onSelect={() => onStatusChange(status)}>
                {LEAD_STATUS_LABELS[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="sm" onClick={() => notifyDemoAction(`Export ${count} leads`, "CSV export arrives with the Reports module.")}>
          <Download />
          <span className="max-sm:sr-only">Export</span>
        </Button>
        <span className="h-5 w-px bg-border" aria-hidden />
        <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Clear selection">
          <X />
        </Button>
      </div>
    </div>
  );
}
