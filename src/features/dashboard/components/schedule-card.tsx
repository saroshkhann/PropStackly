"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Mail, MapPin, MessageCircle, Phone, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { FollowUpChannel, ScheduleItemKind } from "@/domain/schedule";
import { notifyDemoAction } from "@/lib/demo";
import { dayKey, formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ScheduleEntry } from "../data/types";

type Filter = "all" | ScheduleItemKind;

const channelMeta: Record<FollowUpChannel, { icon: LucideIcon; label: string }> = {
  call: { icon: Phone, label: "Call" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  meeting: { icon: Users, label: "Meeting" },
  email: { icon: Mail, label: "Email" },
};

function dayHeading(iso: string, now: string) {
  const diff = Math.round((new Date(`${dayKey(iso)}T00:00:00Z`).getTime() - new Date(`${dayKey(now)}T00:00:00Z`).getTime()) / 86_400_000);
  const prefix = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : null;
  return prefix ? `${prefix} · ${formatDate(iso, "weekday")}` : formatDate(iso, "weekday");
}

export function ScheduleCard({ items, now }: { items: ScheduleEntry[]; now: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  const groups = useMemo(() => {
    const visible = items.filter((item) => filter === "all" || item.kind === filter);
    const byDay = new Map<string, ScheduleEntry[]>();
    for (const item of visible) {
      const key = dayKey(item.startsAt);
      byDay.set(key, [...(byDay.get(key) ?? []), item]);
    }
    return [...byDay.values()];
  }, [items, filter]);

  const nowMs = new Date(now).getTime();
  const nextId = items.find((item) => new Date(item.startsAt).getTime() > nowMs)?.id;
  const counts = {
    all: items.length,
    site_visit: items.filter((i) => i.kind === "site_visit").length,
    follow_up: items.filter((i) => i.kind === "follow_up").length,
  };

  return (
    <SectionCard
      id="upcoming-schedule"
      title="Upcoming follow-ups & site visits"
      description="Next 48 hours across your team"
      className="xl:col-span-5"
      contentClassName="px-0 pb-2"
      action={
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/site-visits">
            Calendar
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <div className="px-5">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All <span className="text-muted-foreground tabular">{counts.all}</span></TabsTrigger>
            <TabsTrigger value="site_visit">Site visits <span className="text-muted-foreground tabular">{counts.site_visit}</span></TabsTrigger>
            <TabsTrigger value="follow_up">Follow-ups <span className="text-muted-foreground tabular">{counts.follow_up}</span></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Nothing scheduled" description="No items match this filter in the next 48 hours." />
      ) : (
        <div className="scrollbar-thin mt-3 max-h-[25rem] overflow-y-auto">
          {groups.map((group) => (
            <div key={group[0]!.startsAt}>
              <p className="sticky top-0 z-10 bg-card/95 px-5 py-1.5 text-[11.5px] font-medium tracking-[0.02em] text-muted-foreground backdrop-blur">
                {dayHeading(group[0]!.startsAt, now)}
              </p>
              <ul className="px-2 pb-2">
                {group.map((item) => (
                  <ScheduleRow key={item.id} item={item} now={now} isNext={item.id === nextId} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function ScheduleRow({ item, now, isNext }: { item: ScheduleEntry; now: string; isNext: boolean }) {
  const isVisit = item.kind === "site_visit";
  const channel = item.channel ? channelMeta[item.channel] : null;
  const DetailIcon = isVisit ? MapPin : (channel?.icon ?? Phone);
  const detail = isVisit ? item.location : channel?.label;

  return (
    <li>
      <button
        type="button"
        onClick={() => notifyDemoAction(isVisit ? "Open site visit" : "Open follow-up")}
        className="group/row flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="w-[64px] shrink-0 pt-0.5">
          <p className="text-[13px] font-semibold text-foreground tabular">{formatDate(item.startsAt, "time")}</p>
          {isNext && <p className="mt-0.5 text-[11px] font-medium text-brand">{formatRelative(item.startsAt, now)}</p>}
        </div>
        <span
          className={cn("mt-1.5 size-2 shrink-0 rounded-full ring-4", isVisit ? "bg-chart-2 ring-chart-2/15" : "bg-chart-1 ring-chart-1/15")}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
            <span className="truncate">{item.title}</span>
            {item.priority === "high" && (
              <span className="shrink-0 rounded-md bg-danger-soft px-1.5 py-px text-[10.5px] font-semibold text-danger">High</span>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span className="font-medium text-secondary-foreground">{isVisit ? "Site visit" : "Follow-up"}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{item.leadName}</span>
          </p>
          {detail && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-subtle-foreground">
              <DetailIcon className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{detail}</span>
            </p>
          )}
        </div>
        <UserAvatar name={item.assignedTo.name} size="xs" className="mt-0.5" />
        <span className="sr-only">Assigned to {item.assignedTo.name}</span>
      </button>
    </li>
  );
}
