"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DetailList } from "@/components/shared/detail-list";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { LeadPriority, LeadStatus } from "@/domain/lead";
import { cn } from "@/lib/utils";
import { LeadPriorityBadge, LeadStatusBadge } from "./lead-badges";

export interface LeadPeekData {
  id: string;
  name: string;
  status: LeadStatus;
  priority: LeadPriority;
  interest: string;
  location: string;
  phoneMasked: string;
  agentName: string | null;
}

/** Compact lead chip that opens a summary, so related-lead context is one click away from tasks and visits. */
export function LeadPeek({ lead, className }: { lead: LeadPeekData; className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex max-w-full items-center gap-1.5 rounded-full border bg-card py-0.5 pr-2 pl-0.5 text-xs text-secondary-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            className,
          )}
          aria-label={`Lead: ${lead.name}. Show details`}
        >
          <UserAvatar name={lead.name} size="xs" className="size-5 text-[9px]" />
          <span className="truncate">{lead.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex items-center gap-3">
          <UserAvatar name={lead.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{lead.name}</p>
            <p className="text-xs text-muted-foreground tabular">{lead.phoneMasked}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <LeadStatusBadge status={lead.status} />
          <LeadPriorityBadge priority={lead.priority} />
        </div>
        <DetailList
          className="mt-3"
          items={[
            { label: "Looking for", value: lead.interest },
            { label: "Area", value: lead.location.split(",")[0] },
            { label: "Agent", value: lead.agentName ?? "Unassigned" },
          ]}
        />
        <Button asChild variant="outline" size="sm" className="mt-3 w-full">
          <Link href={`/leads/${lead.id}`}>
            Open lead
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
