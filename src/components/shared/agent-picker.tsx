"use client";

import { Check, UserRoundX } from "lucide-react";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AgentOption } from "@/features/workspace/types";

interface AgentPickerProps {
  agents: AgentOption[];
  value: string | null;
  onChange: (agentId: string | null) => void;
  children: React.ReactNode;
  align?: "start" | "end";
}

/** Searchable agent list with current workload, so managers can balance assignments. */
export function AgentPicker({ agents, value, onChange, children, align = "start" }: AgentPickerProps) {
  const [open, setOpen] = useState(false);
  const select = (agentId: string | null) => {
    setOpen(false);
    if (agentId !== value) onChange(agentId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search agents…" />
          <CommandList>
            <CommandEmpty>No agents found.</CommandEmpty>
            <CommandGroup heading="Assign to">
              {agents.map((agent) => (
                <CommandItem key={agent.id} value={`${agent.name} ${agent.title}`} onSelect={() => select(agent.id)} className="gap-2.5 py-2">
                  <UserAvatar name={agent.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{agent.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {agent.title} · {agent.openLeads} open leads
                    </span>
                  </span>
                  {agent.id === value && <Check className="text-brand" aria-label="Current assignee" />}
                </CommandItem>
              ))}
            </CommandGroup>
            {value && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => select(null)} className="text-muted-foreground">
                    <UserRoundX aria-hidden />
                    Move to unassigned queue
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
