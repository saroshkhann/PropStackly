"use client";

import { Building2, CalendarPlus, ListPlus, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifyDemoAction } from "@/lib/demo";

const actions = [
  { label: "New lead", icon: UserPlus },
  { label: "New property", icon: Building2 },
  { label: "Schedule site visit", icon: CalendarPlus },
  { label: "Add follow-up", icon: ListPlus },
];

export function QuickAdd() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="default" className="max-sm:size-8 max-sm:px-0" aria-label="Create new">
          <Plus />
          <span className="max-sm:sr-only">New</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Create · demo</DropdownMenuLabel>
        {actions.map((action) => (
          <DropdownMenuItem key={action.label} onSelect={() => notifyDemoAction(action.label)}>
            <action.icon aria-hidden />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
