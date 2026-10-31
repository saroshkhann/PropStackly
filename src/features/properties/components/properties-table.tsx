"use client";

import { useMemo } from "react";
import Link from "next/link";
import { createColumnHelper, metaHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AgentChip } from "@/components/shared/agent-chip";
import { PropertyStatusBadge } from "@/components/shared/property-row";
import { formatArea } from "@/domain/area";
import { LISTING_PURPOSE_LABELS, PROPERTY_TYPE_META, type AreaUnit } from "@/domain/property";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyListItem } from "../data/types";
import { PropertyImageView } from "./property-image";
import { PropertyPrice } from "./property-facts";

type ColumnMeta = { align?: "end"; className?: string };

const features = tableFeatures({ columnMeta: metaHelper<ColumnMeta>() });
const helper = createColumnHelper<typeof features, PropertyListItem>();

function makeColumns(unit: AreaUnit | undefined, now: string) {
  return helper.columns([
    helper.display({
      id: "property",
      header: "Property",
      cell: ({ row }) => {
        const p = row.original;
        const content = (
          <>
            <PropertyImageView image={p.images[0]} className="size-12 shrink-0 rounded-lg" showMarker={false} sizes="48px" />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="truncate font-medium text-foreground group-hover/name:underline group-hover/name:underline-offset-4">{p.title}</span>
                {(p.isDraft || p.hasLocalEdits) && (
                  <span className="shrink-0 rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning">
                    {p.isDraft ? "Draft" : "Edited"}
                  </span>
                )}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {p.sector}, {p.location}
              </span>
            </span>
          </>
        );
        return p.isDraft ? (
          <span className="flex min-w-0 items-center gap-3">{content}</span>
        ) : (
          <Link href={`/properties/${p.id}`} className="group/name flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            {content}
          </Link>
        );
      },
    }),
    helper.display({
      id: "type",
      header: "Type",
      meta: { className: "max-xl:hidden" },
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <p className="text-foreground">{PROPERTY_TYPE_META[row.original.type].label}</p>
          <p className="text-xs text-muted-foreground">{LISTING_PURPOSE_LABELS[row.original.purpose]}</p>
        </div>
      ),
    }),
    helper.display({
      id: "price",
      header: "Price",
      meta: { align: "end" },
      cell: ({ row }) => <PropertyPrice property={row.original} className="text-[13px] whitespace-nowrap" />,
    }),
    helper.display({
      id: "area",
      header: "Area",
      meta: { align: "end", className: "max-md:hidden" },
      cell: ({ row }) => (
        <div className="whitespace-nowrap tabular">
          <p className="text-foreground">{formatArea(row.original.area, unit)}</p>
          {row.original.bedrooms !== null && (
            <p className="text-xs text-muted-foreground">
              {row.original.bedrooms} bed · {row.original.bathrooms} bath
            </p>
          )}
        </div>
      ),
    }),
    helper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => <PropertyStatusBadge status={row.original.status} />,
    }),
    helper.display({
      id: "agent",
      header: "Agent",
      meta: { className: "max-xl:hidden" },
      cell: ({ row }) => <AgentChip name={row.original.agent?.name ?? null} short />,
    }),
    helper.display({
      id: "inquiries",
      header: "Inquiries",
      meta: { align: "end", className: "max-2xl:hidden" },
      cell: ({ row }) => (
        <span className="text-secondary-foreground tabular">
          {row.original.inquiryCount}
          {row.original.openInquiryCount > 0 && <span className="text-brand"> ({row.original.openInquiryCount} new)</span>}
        </span>
      ),
    }),
    helper.display({
      id: "listed",
      header: "Listed",
      meta: { align: "end", className: "max-2xl:hidden" },
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground tabular">{formatRelative(row.original.listedAt, now)}</span>,
    }),
  ]);
}

export function PropertiesTable({ properties, unit, now }: { properties: PropertyListItem[]; unit?: AreaUnit; now: string }) {
  const columns = useMemo(() => makeColumns(unit, now), [unit, now]);
  const table = useTable({ features, columns, data: properties, getRowId: (row) => row.id });

  return (
    <Table className="text-[13px]">
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="border-y bg-muted/40 hover:bg-muted/40">
            {group.headers.map((header) => {
              const meta = header.column.columnDef.meta;
              return (
                <TableHead key={header.id} className={cn("h-9 px-3 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5", meta?.align === "end" && "text-right", meta?.className)}>
                  <table.FlexRender header={header} />
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="hover:bg-muted/40">
            {row.getAllCells().map((cell) => {
              const meta = cell.column.columnDef.meta;
              return (
                <TableCell key={cell.id} className={cn("max-w-[18rem] px-3 py-2.5 first:pl-5 last:pr-5", meta?.align === "end" && "text-right", meta?.className)}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
