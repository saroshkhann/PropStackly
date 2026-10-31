"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navigation, type NavBadgeKey, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

export type SidebarDensity = "full" | "rail" | "responsive";

interface SidebarNavProps {
  badges: Partial<Record<NavBadgeKey, number>>;
  density: SidebarDensity;
  onNavigate?: () => void;
}

/** `responsive` renders an icon rail on tablets and the full sidebar from `lg` up. */
const labelVisibility: Record<SidebarDensity, string> = {
  full: "",
  rail: "sr-only",
  responsive: "max-lg:sr-only",
};

export function SidebarNav(props: SidebarNavProps) {
  return (
    <Suspense fallback={<NavList {...props} activePath={null} />}>
      <NavListWithPath {...props} />
    </Suspense>
  );
}

function NavListWithPath(props: SidebarNavProps) {
  const pathname = usePathname();
  return <NavList {...props} activePath={pathname} />;
}

function NavList({ badges, density, onNavigate, activePath }: SidebarNavProps & { activePath: string | null }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {navigation.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p
            className={cn(
              "px-2.5 pb-1.5 text-[11px] font-medium tracking-[0.04em] text-subtle-foreground uppercase",
              labelVisibility[density],
            )}
          >
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <NavLink
                  item={item}
                  density={density}
                  active={activePath === item.href || Boolean(activePath?.startsWith(`${item.href}/`))}
                  badge={item.badge ? badges[item.badge] : undefined}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

interface NavLinkProps {
  item: NavItem;
  density: SidebarDensity;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}

function NavLink({ item, density, active, badge, onNavigate }: NavLinkProps) {
  const Icon = item.icon;
  const hiddenLabel = labelVisibility[density];

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-sidebar-foreground transition-colors duration-150",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
        density === "rail" && "justify-center px-0",
        density === "responsive" && "max-lg:justify-center max-lg:px-0",
        active && "bg-card text-foreground shadow-card ring-1 ring-sidebar-border hover:bg-card",
      )}
    >
      {active && (
        <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-brand" aria-hidden />
      )}
      <Icon
        className={cn(
          "size-[18px] shrink-0 text-subtle-foreground transition-colors group-hover/nav:text-foreground",
          active && "text-brand group-hover/nav:text-brand",
        )}
        strokeWidth={1.85}
        aria-hidden
      />
      <span className={cn("truncate", hiddenLabel)}>{item.label}</span>
      {badge ? (
        <span
          className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-soft px-1.5 text-[11px] font-semibold text-brand tabular",
            density === "rail" && "absolute -top-0.5 -right-0.5 ml-0 h-4 min-w-4 px-1 text-[10px] ring-2 ring-sidebar",
            density === "responsive" && "max-lg:absolute max-lg:-top-0.5 max-lg:-right-0.5 max-lg:ml-0 max-lg:h-4 max-lg:min-w-4 max-lg:px-1 max-lg:text-[10px] max-lg:ring-2 max-lg:ring-sidebar",
          )}
        >
          <span className="sr-only">, </span>
          {badge}
        </span>
      ) : null}
      {!item.available && density === "full" && (
        <span className="sr-only"> (planned)</span>
      )}
    </Link>
  );

  if (density === "full") return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className={cn(density === "responsive" && "lg:hidden")}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
