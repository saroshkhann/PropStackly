"use client";

import Link from "next/link";
import { ChevronDown, CreditCard, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AgencyMember } from "@/domain/agency";
import { AGENCY_ROLE_LABELS } from "@/domain/tenancy";
import { notifyDemoAction } from "@/lib/demo";

export function UserMenu({ user }: { user: AgencyMember }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-expanded:bg-accent xl:pr-2">
        <UserAvatar name={user.name} size="md" />
        <span className="text-left max-xl:hidden">
          <span className="block text-[13px] leading-tight font-medium text-foreground">{user.name}</span>
          <span className="block text-[11.5px] leading-tight text-muted-foreground">{AGENCY_ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown className="size-3.5 text-subtle-foreground max-xl:hidden" aria-hidden />
        <span className="sr-only">Open account menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => notifyDemoAction("Profile")}>
            <UserRound aria-hidden /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings"><Settings aria-hidden /> Agency settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing"><CreditCard aria-hidden /> Subscription</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/platform"><ShieldCheck aria-hidden /> Platform admin preview</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notifyDemoAction("Sign out", "Authentication (Better Auth) is not connected in this prototype.")}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
