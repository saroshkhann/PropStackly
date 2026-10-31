"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dayKey, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VisitItem } from "../data/types";
import { monthGrid, monthLabel, shiftMonth } from "../lib/visits";
import { visitStatusDot } from "./visit-badges";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface VisitsCalendarProps {
  visits: VisitItem[];
  month: string;
  onMonth: (month: string) => void;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  today: string;
  onOpen: (visit: VisitItem) => void;
}

export function VisitsCalendar({ visits, month, onMonth, selectedDay, onSelectDay, today, onOpen }: VisitsCalendarProps) {
  const days = useMemo(() => monthGrid(month), [month]);
  const byDay = useMemo(() => {
    const map = new Map<string, VisitItem[]>();
    for (const visit of visits) {
      const key = dayKey(visit.startsAt);
      map.set(key, [...(map.get(key) ?? []), visit]);
    }
    for (const list of map.values()) list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return map;
  }, [visits]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold" aria-live="polite">
          {monthLabel(month)}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onMonth(today.slice(0, 7));
              onSelectDay(today);
            }}
          >
            Today
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onMonth(shiftMonth(month, -1))} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onMonth(shiftMonth(month, 1))} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div role="grid" aria-label={`Site visits in ${monthLabel(month)}`} className="border-t">
        <div role="row" className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAYS.map((day) => (
            <div key={day} role="columnheader" className="px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground sm:text-left">
              <span className="sm:hidden">{day[0]}</span>
              <span className="max-sm:hidden">{day}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div key={week} role="row" className="grid grid-cols-7 border-b last:border-b-0">
            {days.slice(week * 7, week * 7 + 7).map((day) => {
              const dayVisits = (byDay.get(day) ?? []).filter((v) => v.status !== "cancelled");
              const inMonth = day.startsWith(month);
              const selected = day === selectedDay;
              const isToday = day === today;
              return (
                <div
                  key={day}
                  role="gridcell"
                  aria-selected={selected}
                  className={cn("relative min-h-14 border-r last:border-r-0 sm:min-h-24", !inMonth && "bg-muted/30", selected && "bg-brand-soft/60")}
                >
                  <button
                    type="button"
                    onClick={() => onSelectDay(day)}
                    aria-label={`${formatDate(`${day}T12:00:00+05:00`, "full")}, ${dayVisits.length} visits`}
                    className="absolute inset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                  />
                  <div className="pointer-events-none relative flex h-full flex-col gap-1 p-1.5">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center self-center rounded-full text-xs tabular sm:self-start",
                        !inMonth && "text-subtle-foreground",
                        isToday && "bg-primary font-semibold text-primary-foreground",
                        selected && !isToday && "font-semibold text-brand",
                      )}
                    >
                      {Number(day.slice(8))}
                    </span>
                    <span className="flex justify-center gap-0.5 sm:hidden" aria-hidden>
                      {dayVisits.slice(0, 3).map((v) => (
                        <span key={v.id} className={cn("size-1.5 rounded-full", visitStatusDot[v.status])} />
                      ))}
                    </span>
                    <ul className="flex flex-col gap-0.5 max-sm:hidden">
                      {dayVisits.slice(0, 2).map((visit) => (
                        <li key={visit.id}>
                          <button
                            type="button"
                            onClick={() => onOpen(visit)}
                            className="pointer-events-auto flex w-full items-center gap-1 truncate rounded-md bg-card px-1.5 py-0.5 text-left text-[11px] shadow-card ring-1 ring-border hover:ring-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            <span className={cn("size-1.5 shrink-0 rounded-full", visitStatusDot[visit.status])} aria-hidden />
                            <span className="font-medium tabular">{formatDate(visit.startsAt, "time").replace(":00", "")}</span>
                            <span className="truncate text-muted-foreground">{visit.customerName.split(" ")[0]}</span>
                          </button>
                        </li>
                      ))}
                      {dayVisits.length > 2 && <li className="px-1.5 text-[11px] text-muted-foreground">+{dayVisits.length - 2} more</li>}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
