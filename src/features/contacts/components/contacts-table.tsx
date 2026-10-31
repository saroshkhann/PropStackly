"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Ellipsis, MessageCircle, Phone } from "lucide-react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AgentChip } from "@/components/shared/agent-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContactListItem } from "../data/types";
import { ContactTypeBadges } from "./contact-type-badges";

type ColumnMeta = { align?: "end"; className?: string };

const features = tableFeatures({
  columnMeta: metaHelper<ColumnMeta>(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper<typeof features, ContactListItem>();

interface ContactsTableProps {
  contacts: ContactListItem[];
  now: string;
  onEdit: (contact: ContactListItem) => void;
  emptyState: React.ReactNode;
}

function ContactName({ contact }: { contact: ContactListItem }) {
  const inner = (
    <>
      <UserAvatar name={contact.name} size="md" />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-medium text-foreground group-hover/name:underline group-hover/name:underline-offset-4">
          <span className="truncate">{contact.name}</span>
          {contact.isDraft && (
            <span className="shrink-0 rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning">Draft</span>
          )}
        </span>
        <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span className="tabular">{contact.phoneMasked}</span>
          {contact.hasWhatsApp && <MessageCircle className="size-3 text-success" aria-label="On WhatsApp" />}
        </span>
      </span>
    </>
  );
  if (contact.isDraft) return <span className="flex min-w-0 items-center gap-3">{inner}</span>;
  return (
    <Link href={`/contacts/${contact.id}`} className="group/name flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      {inner}
    </Link>
  );
}

function makeColumns(now: string, onEdit: (contact: ContactListItem) => void) {
  return helper.columns([
    helper.accessor("name", { header: "Contact", sortFn: "text", cell: (info) => <ContactName contact={info.row.original} /> }),
    helper.accessor((row) => row.types.join(","), {
      id: "types",
      header: "Role",
      sortFn: "text",
      cell: (info) => <ContactTypeBadges types={info.row.original.types} />,
    }),
    helper.accessor("area", {
      header: "Area",
      sortFn: "text",
      meta: { className: "max-lg:hidden" },
      cell: (info) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{info.getValue()}</p>
          <p className="truncate text-xs text-muted-foreground">{info.row.original.occupation ?? info.row.original.city}</p>
        </div>
      ),
    }),
    helper.accessor((row) => row.leadCount * 100 + row.propertyCount, {
      id: "linked",
      header: "Leads · Listings",
      meta: { className: "max-xl:hidden" },
      cell: (info) => {
        const contact = info.row.original;
        return (
          <span className="text-secondary-foreground tabular">
            {contact.leadCount} {contact.leadCount === 1 ? "lead" : "leads"}
            {contact.openLeadCount > 0 && <span className="text-brand"> ({contact.openLeadCount} open)</span>}
            <span className="text-muted-foreground"> · {contact.propertyCount} listed</span>
          </span>
        );
      },
    }),
    helper.accessor((row) => row.owner?.name ?? "", {
      id: "owner",
      header: "Managed by",
      sortFn: "text",
      meta: { className: "max-2xl:hidden" },
      cell: (info) => <AgentChip name={info.row.original.owner?.name ?? null} short />,
    }),
    helper.accessor((row) => row.lastContactedAt ?? "", {
      id: "lastContacted",
      header: "Last contacted",
      sortFn: "alphanumeric",
      meta: { align: "end", className: "max-md:hidden" },
      cell: (info) => (
        <span className="whitespace-nowrap text-muted-foreground tabular">
          {info.row.original.lastContactedAt ? formatRelative(info.row.original.lastContactedAt, now) : "Never"}
        </span>
      ),
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-12" },
      cell: (info) => {
        const contact = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label={`Actions for ${contact.name}`}>
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!contact.isDraft && (
                <DropdownMenuItem asChild>
                  <Link href={`/contacts/${contact.id}`}>Open profile</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => onEdit(contact)}>Edit contact</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Phone aria-hidden /> Call · not connected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ]);
}

export function ContactsTable({ contacts, now, onEdit, emptyState }: ContactsTableProps) {
  const columns = useMemo(() => makeColumns(now, onEdit), [now, onEdit]);
  const table = useTable({
    features,
    columns,
    data: contacts,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 12 } },
  });
  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.state.pagination;

  if (rows.length === 0) return <>{emptyState}</>;

  return (
    <div className="flex flex-col">
      <Table className="text-[13px] sm:min-w-[560px]">
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
            <TableRow key={row.id} className="hover:bg-muted/40">
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
      <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-[13px] text-muted-foreground">
        <p className="tabular">
          Showing <span className="font-medium text-foreground">{pageIndex * pageSize + 1}–{Math.min(contacts.length, (pageIndex + 1) * pageSize)}</span> of{" "}
          <span className="font-medium text-foreground">{contacts.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
