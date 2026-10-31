"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Ellipsis, PhoneCall, UserRoundCog } from "lucide-react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type RowSelectionState,
  type Updater,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AgentChip } from "@/components/shared/agent-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { LEAD_INTENT_LABELS, LEAD_PRIORITY_LABELS, LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/domain/lead";
import type { AgentOption } from "@/features/workspace/types";
import { notifyDemoAction } from "@/lib/demo";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeadListItem } from "../data/types";
import { formatBudget } from "../lib/format-budget";
import { AgentPicker } from "@/components/shared/agent-picker";
import { LeadStatusBadge, priorityMeta } from "./lead-badges";

type ColumnMeta = { align?: "end"; className?: string };

const features = tableFeatures({
  columnMeta: metaHelper<ColumnMeta>(),
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, LeadListItem>();

export const PAGE_SIZE = 10;

interface LeadActionsContext {
  now: string;
  agents: AgentOption[];
  onAssign: (leadIds: string[], agentId: string | null) => void;
  onStatusChange: (leadIds: string[], status: LeadStatus) => void;
}

function LeadName({ lead }: { lead: LeadListItem }) {
  const { icon: PriorityIcon, className: priorityTone } = priorityMeta[lead.priority];
  const content = (
    <>
      <UserAvatar name={lead.name} size="md" />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 truncate font-medium text-foreground group-hover/name:underline group-hover/name:underline-offset-4">
          <span className="truncate">{lead.name}</span>
          <PriorityIcon className={cn("size-3.5 shrink-0", priorityTone)} aria-label={`${LEAD_PRIORITY_LABELS[lead.priority]} priority`} />
          {lead.isDraft && (
            <span className="rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning no-underline">Draft</span>
          )}
        </span>
        <span className="block truncate text-xs text-muted-foreground tabular">{lead.phoneMasked}</span>
      </span>
    </>
  );
  if (lead.isDraft) return <span className="flex min-w-0 items-center gap-3">{content}</span>;
  return (
    <Link href={`/leads/${lead.id}`} className="group/name flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      {content}
    </Link>
  );
}

function RowActions({ lead, ctx }: { lead: LeadListItem; ctx: LeadActionsContext }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Actions for ${lead.name}`}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {!lead.isDraft && (
          <DropdownMenuItem asChild>
            <Link href={`/leads/${lead.id}`}>Open lead</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserRoundCog aria-hidden /> Assign to
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuRadioGroup value={lead.assignedToId ?? ""} onValueChange={(id) => ctx.onAssign([lead.id], id || null)}>
              {ctx.agents.map((agent) => (
                <DropdownMenuRadioItem key={agent.id} value={agent.id}>
                  {agent.name}
                </DropdownMenuRadioItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="">Unassigned</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuRadioGroup value={lead.status} onValueChange={(status) => ctx.onStatusChange([lead.id], status as LeadStatus)}>
              {LEAD_STATUSES.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notifyDemoAction("Log a call")}>
          <PhoneCall aria-hidden /> Log a call
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function makeColumns(ctx: LeadActionsContext) {
  return helper.columns([
    helper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          aria-label="Select all leads on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          aria-label={`Select ${row.original.name}`}
        />
      ),
      meta: { className: "w-10" },
    }),
    helper.accessor("name", {
      header: "Lead",
      sortFn: "text",
      cell: (info) => <LeadName lead={info.row.original} />,
    }),
    helper.accessor("interest", {
      header: "Looking for",
      enableSorting: false,
      meta: { className: "max-w-[12rem]" },
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
      meta: { align: "end", className: "max-xl:hidden" },
      cell: (info) => <span className="text-foreground tabular">{formatBudget(info.row.original)}</span>,
    }),
    helper.accessor("sourceLabel", {
      header: "Source",
      sortFn: "text",
      meta: { className: "max-2xl:hidden" },
      cell: (info) => <span className="whitespace-nowrap text-secondary-foreground">{info.getValue()}</span>,
    }),
    helper.accessor((row) => LEAD_STATUSES.indexOf(row.status), {
      id: "status",
      header: "Status",
      cell: (info) => <LeadStatusBadge status={info.row.original.status} />,
    }),
    helper.accessor((row) => row.assignedTo?.name ?? "", {
      id: "agent",
      header: "Agent",
      sortFn: "text",
      meta: { className: "max-lg:hidden" },
      cell: (info) => {
        const lead = info.row.original;
        return (
          <AgentPicker agents={ctx.agents} value={lead.assignedToId} onChange={(agentId) => ctx.onAssign([lead.id], agentId)}>
            <button
              type="button"
              className="-mx-1.5 flex max-w-full items-center rounded-md px-1.5 py-1 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Change agent for ${lead.name}, currently ${lead.assignedTo?.name ?? "unassigned"}`}
            >
              <AgentChip name={lead.assignedTo?.name ?? null} short />
            </button>
          </AgentPicker>
        );
      },
    }),
    helper.accessor("lastActivityAt", {
      header: "Last activity",
      sortFn: "alphanumeric",
      meta: { align: "end", className: "max-2xl:hidden" },
      cell: (info) => <span className="whitespace-nowrap text-muted-foreground tabular">{formatRelative(info.getValue(), ctx.now)}</span>,
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (info) => <RowActions lead={info.row.original} ctx={ctx} />,
      meta: { className: "w-12" },
    }),
  ]);
}

interface LeadsTableProps extends LeadActionsContext {
  leads: LeadListItem[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: (updater: Updater<RowSelectionState>) => void;
  emptyState: React.ReactNode;
}

export function LeadsTable({ leads, rowSelection, onRowSelectionChange, emptyState, now, agents, onAssign, onStatusChange }: LeadsTableProps) {
  const columns = useMemo(() => makeColumns({ now, agents, onAssign, onStatusChange }), [now, agents, onAssign, onStatusChange]);
  const table = useTable({
    features,
    columns,
    data: leads,
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange,
    initialState: { pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
  });

  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.state.pagination;
  const firstRow = leads.length ? pageIndex * pageSize + 1 : 0;
  const lastRow = Math.min(leads.length, (pageIndex + 1) * pageSize);

  return (
    <div className="flex flex-col">
      {rows.length === 0 ? (
        emptyState
      ) : (
        <Table className="text-[13px] max-sm:min-w-0 sm:min-w-[640px]">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="border-y bg-muted/40 hover:bg-muted/40">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      className={cn("h-9 px-3 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5", meta?.align === "end" && "text-right", meta?.className)}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn("inline-flex items-center gap-1 rounded-md transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", sorted && "text-foreground")}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? <ArrowUp className="size-3" aria-hidden /> : sorted === "desc" ? <ArrowDown className="size-3" aria-hidden /> : <ArrowUpDown className="size-3 opacity-40" aria-hidden />}
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
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className="hover:bg-muted/40 data-[state=selected]:bg-brand-soft/60">
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <TableCell key={cell.id} className={cn("max-w-[15rem] px-3 py-3 first:pl-5 last:pr-5", meta?.align === "end" && "text-right", meta?.className)}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {leads.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-[13px] text-muted-foreground">
          <p className="tabular">
            Showing <span className="font-medium text-foreground">{firstRow}–{lastRow}</span> of{" "}
            <span className="font-medium text-foreground">{leads.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="tabular max-sm:hidden">
              Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
