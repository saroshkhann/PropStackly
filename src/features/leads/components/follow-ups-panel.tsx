"use client";

import { CalendarClock, CalendarPlus, Check, MapPin, MessageCircle, Phone, Users, Mail, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentChip } from "@/components/shared/agent-chip";
import { EmptyState } from "@/components/shared/empty-state";
import type { FollowUpChannel } from "@/domain/schedule";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FollowUpEntry } from "../data/types";

const channelIcons: Record<FollowUpChannel, LucideIcon> = { call: Phone, whatsapp: MessageCircle, meeting: Users, email: Mail };

interface FollowUpsPanelProps {
  items: FollowUpEntry[];
  now: string;
  onAdd: () => void;
  onToggleComplete: (id: string) => void;
}

export function FollowUpsPanel({ items, now, onAdd, onToggleComplete }: FollowUpsPanelProps) {
  const nowMs = new Date(now).getTime();
  const open = items.filter((item) => !item.completedAt).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const overdue = open.filter((item) => new Date(item.startsAt).getTime() < nowMs);
  const upcoming = open.filter((item) => new Date(item.startsAt).getTime() >= nowMs);
  const completed = items.filter((item) => item.completedAt).sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No follow-ups scheduled"
        description="Leads with a next step booked convert far more often. Schedule the next touchpoint."
        action={<Button onClick={onAdd}><CalendarPlus />Schedule follow-up</Button>}
      />
    );
  }

  const groups = [
    { label: "Overdue", items: overdue, tone: "text-danger" },
    { label: "Upcoming", items: upcoming, tone: "text-muted-foreground" },
    { label: "Completed", items: completed, tone: "text-muted-foreground" },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onAdd}>
          <CalendarPlus />
          Schedule follow-up
        </Button>
      </div>
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className={cn("mb-2 text-[11.5px] font-medium tracking-[0.02em]", group.tone)}>
            {group.label} · {group.items.length}
          </h3>
          <ul className="flex flex-col gap-2">
            {group.items.map((item) => {
              const isVisit = item.kind === "site_visit";
              const DetailIcon = isVisit ? MapPin : item.channel ? channelIcons[item.channel] : Phone;
              const done = Boolean(item.completedAt);
              const late = !done && new Date(item.startsAt).getTime() < nowMs;
              return (
                <li key={item.id} className={cn("flex items-start gap-3 rounded-lg border p-3", late && "border-danger/25 bg-danger-soft/40", done && "bg-muted/30")}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    aria-label={done ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
                    onClick={() => onToggleComplete(item.id)}
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      done && "border-success bg-success text-white hover:border-success",
                    )}
                  >
                    {done && <Check className="size-3" aria-hidden />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("flex flex-wrap items-center gap-2 text-[13px] font-medium", done && "text-muted-foreground line-through")}>
                      {item.title}
                      {item.priority === "high" && !done && (
                        <span className="rounded-md bg-danger-soft px-1.5 py-px text-[10.5px] font-semibold text-danger no-underline">High</span>
                      )}
                      {item.isDraft && (
                        <span className="rounded-full border border-dashed border-warning/40 px-1.5 py-px text-[10.5px] font-medium text-warning">Not saved</span>
                      )}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className={cn("tabular", late && "font-medium text-danger")}>
                        {formatDate(item.startsAt, "weekday")}, {formatDate(item.startsAt, "time")} · {formatRelative(item.startsAt, now)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DetailIcon className="size-3" aria-hidden />
                        {isVisit ? item.location : item.channel ? item.channel.replace("whatsapp", "WhatsApp").replace(/^./, (c) => c.toUpperCase()) : "Follow-up"}
                      </span>
                    </p>
                  </div>
                  <AgentChip name={item.assignedTo?.name ?? null} short className="shrink-0 text-xs max-sm:hidden" />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
