"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavBadgeKey } from "@/config/navigation";
import type { TrialStatus } from "@/domain/subscription";
import { BrandLogo } from "./brand-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarTrialCard } from "./trial-status";

export function MobileNav({ badges, trial }: { badges: Partial<Record<NavBadgeKey, number>>; trial: TrialStatus }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[284px] gap-0 bg-sidebar p-0">
        <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
          <SheetTitle asChild>
            <div><BrandLogo /></div>
          </SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
        </SheetHeader>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav badges={badges} density="full" onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <SidebarTrialCard trial={trial} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
