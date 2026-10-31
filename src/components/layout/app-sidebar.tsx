"use client";

import Link from "next/link";
import { LifeBuoy, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavBadgeKey } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo, BrandMark } from "./brand-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarTrialCard } from "./trial-status";
import type { TrialStatus } from "@/domain/subscription";
import { notifyDemoAction } from "@/lib/demo";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  badges: Partial<Record<NavBadgeKey, number>>;
  trial: TrialStatus;
}

export function AppSidebar({ collapsed, onToggle, badges, trial }: AppSidebarProps) {
  const density = collapsed ? "rail" : "responsive";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[68px]" : "w-[68px] lg:w-[256px]",
      )}
    >
      <div className={cn("flex h-16 shrink-0 items-center px-4", collapsed ? "justify-center px-0" : "max-lg:justify-center max-lg:px-0 lg:justify-between")}>
        <Link href="/dashboard" className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="PropStackly dashboard">
          {collapsed ? <BrandMark /> : (
            <>
              <BrandMark className="lg:hidden" />
              <BrandLogo className="max-lg:hidden" />
            </>
          )}
        </Link>
        {!collapsed && (
          <Button variant="ghost" size="icon-sm" onClick={onToggle} className="text-muted-foreground max-lg:hidden" aria-label="Collapse sidebar">
            <PanelLeftClose />
          </Button>
        )}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pt-1 pb-4">
        <SidebarNav badges={badges} density={density} />
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3">
        {!collapsed && <SidebarTrialCard trial={trial} className="max-lg:hidden" />}
        <div className={cn("flex items-center gap-1", collapsed ? "flex-col" : "max-lg:flex-col")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className={cn("text-muted-foreground", !collapsed && "justify-start max-lg:size-8 max-lg:px-0 lg:flex-1")}
                onClick={() => notifyDemoAction("Help centre")}
              >
                <LifeBuoy />
                <span className={cn(collapsed ? "sr-only" : "max-lg:sr-only")}>Help & support</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className={cn(!collapsed && "lg:hidden")}>Help & support</TooltipContent>
          </Tooltip>
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onToggle} className="text-muted-foreground max-lg:hidden" aria-label="Expand sidebar">
                  <PanelLeftOpen />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}
