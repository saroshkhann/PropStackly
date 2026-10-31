import {
  ArrowRightLeft,
  CalendarCheck,
  CircleDot,
  Mail,
  MessageCircle,
  NotebookPen,
  Phone,
  Sparkles,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import type { ActivityKind } from "@/domain/activity";
import { dayKey, formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TimelineEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  body: string | null;
  actorName: string | null;
  createdAt: string;
  isDraft?: boolean;
  context?: React.ReactNode;
}

const kindMeta: Record<ActivityKind, { icon: LucideIcon; className: string }> = {
  created: { icon: Sparkles, className: "bg-brand-soft text-brand" },
  note: { icon: NotebookPen, className: "bg-warning-soft text-warning" },
  call: { icon: Phone, className: "bg-info-soft text-info" },
  whatsapp: { icon: MessageCircle, className: "bg-success-soft text-success" },
  email: { icon: Mail, className: "bg-info-soft text-info" },
  status_change: { icon: ArrowRightLeft, className: "bg-muted text-secondary-foreground" },
  assignment: { icon: UserRoundCheck, className: "bg-muted text-secondary-foreground" },
  site_visit: { icon: CalendarCheck, className: "bg-[oklch(0.96_0.03_45)] text-[oklch(0.52_0.15_45)]" },
  follow_up: { icon: CircleDot, className: "bg-muted text-secondary-foreground" },
};

function groupLabel(iso: string, now: string) {
  const key = dayKey(iso);
  if (key === dayKey(now)) return "Today";
  const yesterday = new Date(new Date(now).getTime() - 86_400_000).toISOString();
  if (key === dayKey(yesterday)) return "Yesterday";
  return formatDate(iso, "weekday");
}

export function ActivityTimeline({ entries, now }: { entries: TimelineEntry[]; now: string }) {
  const groups: { label: string; items: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const label = groupLabel(entry.createdAt, now);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(entry);
    else groups.push({ label, items: [entry] });
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className="mb-2 text-[11.5px] font-medium tracking-[0.02em] text-muted-foreground">{group.label}</h3>
          <ol className="relative">
            {group.items.map((entry, index) => {
              const meta = kindMeta[entry.kind];
              const Icon = meta.icon;
              const isLast = index === group.items.length - 1;
              return (
                <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && <span className="absolute top-8 bottom-0 left-[15px] w-px bg-border" aria-hidden />}
                  <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card", meta.className)}>
                    <Icon className="size-[15px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <p className="text-[13px] font-medium text-foreground">
                        {entry.title}
                        {entry.isDraft && (
                          <span className="ml-2 rounded-full border border-dashed border-warning/40 px-1.5 py-px text-[10.5px] font-medium text-warning">
                            Not saved
                          </span>
                        )}
                      </p>
                      <time dateTime={entry.createdAt} className="text-xs text-subtle-foreground tabular" title={formatDate(entry.createdAt, "dateTime")}>
                        {formatRelative(entry.createdAt, now)}
                      </time>
                    </div>
                    {entry.body && <p className="mt-1 text-[13px] leading-relaxed text-secondary-foreground">{entry.body}</p>}
                    {(entry.actorName || entry.context) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.actorName ? `by ${entry.actorName}` : null}
                        {entry.actorName && entry.context ? " · " : null}
                        {entry.context}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
