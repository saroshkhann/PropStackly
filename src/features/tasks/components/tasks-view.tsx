"use client";

import { useMemo, useState } from "react";
import { AlarmClock, CalendarCheck2, CheckCircle2, Flag, ListTodo, Plus, SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FacetFilter } from "@/components/shared/facet-filter";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_TYPES,
  TASK_TYPE_LABELS,
  type TaskStatus,
} from "@/domain/task";
import { SegmentedControl } from "@/features/properties/components/segmented-control";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TaskItem, TasksPageData } from "../data/types";
import { emptyTaskFilters, filterTasks, groupAgenda, summarizeTasks, weekStrip, type TaskFilters } from "../lib/task-filters";
import type { TaskFormValues } from "../lib/task-schema";
import { DayStrip } from "./day-strip";
import { TaskDialog } from "./task-dialog";
import { TaskRow } from "./task-row";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

export function TasksView({ data }: { data: TasksPageData }) {
  const { now, agents, leads } = data;
  const [tasks, setTasks] = useState<TaskItem[]>(data.tasks);
  const [filters, setFilters] = useState<TaskFilters>(emptyTaskFilters);
  const [scope, setScope] = useState<"team" | "mine">("team");
  const [dialog, setDialog] = useState<{ open: boolean; task: TaskItem | null }>({ open: false, task: null });

  const scoped = useMemo(() => (scope === "mine" ? tasks.filter((t) => t.assignedToId === data.currentUserId) : tasks), [tasks, scope, data.currentUserId]);
  const filtered = useMemo(() => filterTasks(scoped, filters), [scoped, filters]);
  const groups = useMemo(() => groupAgenda(filtered, now), [filtered, now]);
  const summary = useMemo(() => summarizeTasks(scoped, now), [scoped, now]);
  const days = useMemo(() => weekStrip(scoped, now), [scoped, now]);
  const set = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const active = Boolean(filters.query || filters.day || filters.statuses.length || filters.priorities.length || filters.types.length || filters.assignees.length);

  const update = (task: TaskItem, changes: Partial<TaskItem>, message: string) => {
    setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, ...changes, hasLocalEdits: t.isDraft ? undefined : true } : t)));
    toast.success(message, { description: sessionOnly });
  };

  const setStatus = (task: TaskItem, status: TaskStatus) =>
    update(task, { status, completedAt: status === "done" ? now : null }, status === "done" ? `Completed "${task.title}"` : `Marked ${TASK_STATUS_LABELS[status].toLowerCase()}`);

  const save = (values: TaskFormValues) => {
    const assignee = agents.find((a) => a.id === values.assignedToId);
    const lead = leads.find((l) => l.id === values.leadId) ?? null;
    const dueAt = new Date(`${values.date}T${values.time}:00+05:00`).toISOString();
    const fields = {
      title: values.title,
      type: values.type,
      priority: values.priority,
      status: values.status,
      dueAt,
      assignedToId: values.assignedToId,
      assignee: assignee ? { id: assignee.id, name: assignee.name } : null,
      leadId: lead?.id ?? null,
      lead,
      notes: values.notes || null,
      completedAt: values.status === "done" ? now : null,
    };
    if (dialog.task) {
      update(dialog.task, fields, "Task updated");
      return;
    }
    const draft: TaskItem = {
      id: `draft_${crypto.randomUUID().slice(0, 8)}`,
      agencyId: tasks[0]?.agencyId ?? "",
      dealId: null,
      createdAt: now,
      isDraft: true,
      ...fields,
    };
    setTasks((current) => [...current, draft]);
    toast.success("Task created", { description: sessionOnly });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Sales<DemoBadge /></span>}
        title="Tasks & follow-ups"
        description="Everything your team needs to do today, with overdue work surfaced first."
        actions={
          <>
            <SegmentedControl
              label="Whose tasks"
              value={scope}
              onChange={setScope}
              options={[
                { value: "team", label: "Team" },
                { value: "mine", label: "Mine" },
              ]}
            />
            <Button onClick={() => setDialog({ open: true, task: null })}>
              <Plus />
              New task
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Due today" icon={CalendarCheck2} value={formatNumber(summary.dueToday)} hint="Still open" />
        <StatCard label="Overdue" icon={AlarmClock} value={formatNumber(summary.overdue)} hint={summary.overdue ? "Needs attention first" : "Nothing overdue"} tone={summary.overdue ? "attention" : "default"} />
        <StatCard label="High priority" icon={Flag} value={formatNumber(summary.highPriority)} hint="Open high-priority tasks" />
        <StatCard label="Completed" icon={CheckCircle2} value={formatNumber(summary.completedThisWeek)} hint="In the last 7 days" />
      </div>

      <DayStrip days={days} selected={filters.day} onSelect={(day) => set("day", day)} />

      <section aria-label="Task list" className="flex min-w-0 flex-col rounded-xl border bg-card shadow-card">
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <SearchInput value={filters.query} onChange={(query) => set("query", query)} placeholder="Search tasks, leads, agents…" label="Search tasks" className="lg:w-72" />
          <div className="flex flex-wrap items-center gap-2">
            <FacetFilter title="Status" selected={filters.statuses} onChange={(v) => set("statuses", v)} options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s], count: scoped.filter((t) => t.status === s).length }))} />
            <FacetFilter title="Priority" selected={filters.priorities} onChange={(v) => set("priorities", v)} options={TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_LABELS[p], count: scoped.filter((t) => t.priority === p).length }))} />
            <FacetFilter title="Type" selected={filters.types} onChange={(v) => set("types", v)} options={TASK_TYPES.map((t) => ({ value: t, label: TASK_TYPE_LABELS[t], count: scoped.filter((x) => x.type === t).length }))} />
            {scope === "team" && (
              <FacetFilter title="Assignee" searchable selected={filters.assignees} onChange={(v) => set("assignees", v)} options={agents.map((a) => ({ value: a.id, label: a.name, count: tasks.filter((t) => t.assignedToId === a.id).length }))} />
            )}
            {active && (
              <Button variant="ghost" onClick={() => setFilters(emptyTaskFilters)}>
                Reset
                <X />
              </Button>
            )}
          </div>
        </div>

        {filters.day && (
          <p className="border-b bg-muted/30 px-5 py-2 text-[13px] text-muted-foreground">
            Showing {formatDate(`${filters.day}T12:00:00+05:00`, "full")}
          </p>
        )}

        {groups.length === 0 ? (
          active ? (
            <EmptyState icon={SearchX} title="No tasks match" description="Try another day or clear the filters." action={<Button variant="outline" onClick={() => setFilters(emptyTaskFilters)}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={ListTodo} title="You're all clear" description="No tasks yet. Create one to start your day." action={<Button onClick={() => setDialog({ open: true, task: null })}><Plus />New task</Button>} />
          )
        ) : (
          groups.map((group) => (
            <section key={group.id} aria-label={group.label} className="border-b last:border-b-0">
              <h2
                className={cn(
                  "sticky top-16 z-10 flex items-center gap-2 border-b bg-card/95 px-4 py-2 text-xs font-semibold tracking-[0.02em] backdrop-blur sm:px-5",
                  group.id === "overdue" ? "text-danger" : "text-muted-foreground",
                )}
              >
                {group.id === "overdue" && <AlarmClock className="size-3.5" aria-hidden />}
                {group.label}
                <span className="font-medium tabular">{group.tasks.length}</span>
              </h2>
              <ul className="divide-y">
                {group.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    now={now}
                    onToggleDone={(t) => setStatus(t, t.status === "done" ? "todo" : "done")}
                    onStatus={setStatus}
                    onEdit={(t) => setDialog({ open: true, task: t })}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </section>

      <TaskDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        task={dialog.task}
        defaults={{ date: filters.day ?? undefined, assignedToId: scope === "mine" ? data.currentUserId : undefined }}
        agents={agents}
        leads={leads}
        now={now}
        onSubmit={save}
      />
    </div>
  );
}
