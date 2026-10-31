"use client";

import { useState } from "react";
import { Bell, CalendarClock, CheckCheck, Handshake, Hourglass, ListChecks, UserPlus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNotification, NotificationKind } from "@/domain/notification";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const kindIcons: Record<NotificationKind, LucideIcon> = {
  lead_assigned: UserPlus,
  site_visit: CalendarClock,
  deal_update: Handshake,
  trial: Hourglass,
  task_due: ListChecks,
};

export function NotificationsMenu({ notifications, now }: { notifications: AppNotification[]; now: string }) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(notifications.filter((n) => n.read).map((n) => n.id)));
  const unread = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
          <Bell />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-background" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread > 0 ? `${unread} unread` : "You're all caught up"}</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            disabled={unread === 0}
            onClick={() => setReadIds(new Set(notifications.map((n) => n.id)))}
            className="text-muted-foreground"
          >
            <CheckCheck />
            Mark all read
          </Button>
        </div>
        <div className="scrollbar-thin max-h-[22rem] overflow-y-auto p-1">
          {notifications.map((notification) => {
            const Icon = kindIcons[notification.kind];
            const isUnread = !readIds.has(notification.id);
            return (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(event) => {
                  event.preventDefault();
                  setReadIds((prev) => new Set(prev).add(notification.id));
                }}
                className="items-start gap-3 rounded-lg px-3 py-2.5"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[13px] leading-snug", isUnread ? "font-semibold text-foreground" : "font-medium text-secondary-foreground")}>
                    {notification.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{notification.body}</span>
                  <span className="mt-1 block text-[11px] text-subtle-foreground">{formatRelative(notification.createdAt, now)}</span>
                </span>
                {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
              </DropdownMenuItem>
            );
          })}
        </div>
        <div className="border-t px-4 py-2.5 text-[11.5px] text-muted-foreground">
          Sample notifications · read state resets on reload
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
