"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Search, UserPlus, Building2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { allNavItems } from "@/config/navigation";
import { notifyDemoAction } from "@/lib/demo";

const quickActions = [
  { label: "Add a new lead", icon: UserPlus },
  { label: "Add a property listing", icon: Building2 },
  { label: "Schedule a site visit", icon: CalendarPlus },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group hidden h-9 w-full max-w-md items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground shadow-card transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:flex"
      >
        <Search className="size-4 text-subtle-foreground" aria-hidden />
        <span className="flex-1 truncate text-left">Search leads, properties, contacts…</span>
        <Kbd className="max-lg:hidden">⌘K</Kbd>
      </button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Search">
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-xl" title="Search PropStackly" description="Jump to a module or start a common action">
        <CommandInput placeholder="Search modules and actions…" />
        <CommandList>
          <CommandEmpty>No matches. Record search arrives with the backend.</CommandEmpty>
          <CommandGroup heading="Go to">
            {allNavItems.map((item) => (
              <CommandItem key={item.id} value={`${item.label} ${item.description}`} onSelect={() => run(() => router.push(item.href))}>
                <item.icon aria-hidden />
                <span className="whitespace-nowrap">{item.label}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground max-sm:hidden">{item.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick actions · demo">
            {quickActions.map((action) => (
              <CommandItem key={action.label} onSelect={() => run(() => notifyDemoAction(action.label))}>
                <action.icon aria-hidden />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <div className="border-t px-3 py-2 text-[11.5px] text-muted-foreground">
          Searching leads, contacts, and listings will be available once the database is connected.
        </div>
      </CommandDialog>
    </>
  );
}
