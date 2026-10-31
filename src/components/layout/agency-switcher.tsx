"use client";

import { Building, Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Agency } from "@/domain/agency";
import { notifyDemoAction } from "@/lib/demo";
import { initials } from "@/lib/format";

export function AgencySwitcher({ agency, planLabel }: { agency: Agency; planLabel: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex h-9 max-w-[15rem] min-w-0 shrink-0 items-center gap-2.5 rounded-lg px-1.5 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-expanded:bg-accent">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-[11px] font-semibold text-brand shadow-card">
          {initials(agency.name)}
        </span>
        <span className="min-w-0 max-sm:hidden">
          <span className="block truncate text-[13px] leading-tight font-semibold text-foreground">{agency.name}</span>
          <span className="block truncate text-[11.5px] leading-tight text-muted-foreground">
            {agency.city} · {planLabel}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
        <span className="sr-only">Switch agency workspace</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Agency workspaces</DropdownMenuLabel>
        <DropdownMenuItem>
          <Building aria-hidden />
          <span className="flex-1 truncate">{agency.name}</span>
          <Check className="text-brand" aria-hidden />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notifyDemoAction("Create agency workspace")}>
          <Plus aria-hidden />
          Register another agency
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
