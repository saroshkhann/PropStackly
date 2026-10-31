"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight, Ellipsis, Inbox } from "lucide-react";
import {
  createColumnHelper,
  createSortedRowModel,
  metaHelper,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { AgentChip } from "@/components/shared/agent-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { LEAD_INTENT_LABELS } from "@/domain/lead";
import { notifyDemoAction } from "@/lib/demo";
import { formatPKRCompact, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecentLead } from "../data/types";
import { LeadStatusBadge } from "@/features/leads/components/lead-badges";

type ColumnMeta = { align?: "end"; className?: string };

const features = tableFeatures({
  columnMeta: metaHelper<ColumnMeta>(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

const helper = createColumnHelper<typeof features, RecentLead>();

function formatBudget(lead: RecentLead) {
  const suffix = lead.intent === "rent" ? "/mo" : "";
  return `${formatPKRCompact(lead.budgetMinPKR, { prefix: false })} – ${formatPKRCompact(lead.budgetMaxPKR, { prefix: false })}${suffix}`;
}

const STATUS_ORDER = ["new", "contacted", "qualified", "site_visit", "negotiation", "won", "lost"] as const;

function makeColumns(now: string) {
  return helper.columns([
    helper.accessor("name", {
      header: "Lead",
      sortFn: "text",
      cell: (info) => {
        const lead = info.row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={lead.name} size="md" />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{lead.name}</p>
              <p className="truncate text-xs text-muted-foreground tabular">{lead.phoneMasked}</p>
            </div>
          </div>
        );
      },
    }),
    helper.accessor("interest", {
      header: "Looking for",
      enableSorting: false,
      cell: (info) => {
        const lead = info.row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-foreground">
              <span className="text-muted-foreground">{LEAD_INTENT_LABELS[lead.intent]} · </span>
              {lead.interest}
            </p>
            <p className="truncate text-xs text-muted-foreground">{lead.location}</p>
          </div>
        );
      },
    }),
    helper.accessor((row) => row.budgetMaxPKR, {
      id: "budget",
      header: "Budget (PKR)",
      meta: { align: "end" },
      cell: (info) => <span className="text-foreground tabular">{formatBudget(info.row.original)}</span>,
    }),
    helper.accessor("sourceLabel", {
      header: "Source",
      sortFn: "text",
      meta: { className: "max-2xl:hidden" },
      cell: (info) => <span className="whitespace-nowrap text-secondary-foreground">{info.getValue()}</span>,
    }),
    helper.accessor((row) => STATUS_ORDER.indexOf(row.status), {
      id: "status",
      header: "Status",
      cell: (info) => <LeadStatusBadge status={info.row.original.status} />,
    }),
    helper.accessor((row) => row.assignedTo?.name ?? "", {
      id: "assignedTo",
      header: "Agent",
      sortFn: "text",
      meta: { className: "max-xl:hidden" },
      cell: (info) => <AgentChip name={info.row.original.assignedTo?.name ?? null} short />,
    }),
    helper.accessor("lastActivityAt", {
      header: "Last activity",
      sortFn: "alphanumeric",
      meta: { align: "end" },
      cell: (info) => <span className="whitespace-nowrap text-muted-foreground tabular">{formatRelative(info.getValue(), now)}</span>,
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (info) => <LeadActions name={info.row.original.name} />,
    }),
  ]);
}

function LeadActions({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Actions for ${name}`}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Demo actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => notifyDemoAction("Open lead")}>View lead</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notifyDemoAction("Log a call")}>Log a call</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notifyDemoAction("Schedule site visit")}>Schedule site visit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notifyDemoAction("Reassign lead")}>Reassign</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecentLeadsTable({ leads, now }: { leads: RecentLead[]; now: string }) {
  const columns = useMemo(() => makeColumns(now), [now]);
  const table = useTable({ features, columns, data: leads });
  const rows = table.getRowModel().rows;

  return (
    <SectionCard
      id="recent-leads"
      title="Recent leads"
      description="Latest inbound inquiries across all sources"
      contentClassName="px-0 pb-0"
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/leads">
            View all leads
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title="No leads yet" description="New inquiries from portals, ads, and WhatsApp will appear here." />
      ) : (
        <Table className="min-w-[680px] text-[13px]">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="border-y bg-muted/40 hover:bg-muted/40">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      className={cn(
                        "h-9 px-3 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5",
                        meta?.align === "end" && "text-right",
                        meta?.className,
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            sorted && "text-foreground",
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" aria-hidden />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="group/row hover:bg-muted/40">
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "max-w-[15rem] px-3 py-3 first:pl-5 last:w-12 last:pr-5",
                        meta?.align === "end" && "text-right",
                        meta?.className,
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
