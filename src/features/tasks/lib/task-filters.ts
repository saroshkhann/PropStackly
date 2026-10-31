import { isOverdue, type TaskPriority, type TaskStatus, type TaskType } from "@/domain/task";
import { dayKey } from "@/lib/format";
import type { TaskItem } from "../data/types";

export interface TaskFilters {
  query: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  types: TaskType[];
  assignees: string[];
  /** Restricts the agenda to one calendar day (YYYY-MM-DD in Asia/Karachi). */
  day: string | null;
}

export const emptyTaskFilters: TaskFilters = { query: "", statuses: [], priorities: [], types: [], assignees: [], day: null };

export function filterTasks(tasks: TaskItem[], filters: TaskFilters) {
  const query = filters.query.toLowerCase().trim();
  return tasks.filter((task) => {
    if (query && ![task.title, task.notes ?? "", task.lead?.name ?? "", task.assignee?.name ?? ""].join(" ").toLowerCase().includes(query)) return false;
    if (filters.statuses.length && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false;
    if (filters.types.length && !filters.types.includes(task.type)) return false;
    if (filters.assignees.length && !filters.assignees.includes(task.assignedToId)) return false;
    if (filters.day && dayKey(task.dueAt) !== filters.day) return false;
    return true;
  });
}

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export interface AgendaGroup {
  id: "overdue" | "today" | "tomorrow" | "week" | "later" | "done";
  label: string;
  tasks: TaskItem[];
}

function addDays(iso: string, days: number) {
  return dayKey(new Date(new Date(iso).getTime() + days * 86_400_000).toISOString());
}

/** Buckets open tasks by urgency; completed tasks sink to the bottom. */
export function groupAgenda(tasks: TaskItem[], now: string): AgendaGroup[] {
  const today = dayKey(now);
  const tomorrow = addDays(now, 1);
  const weekEnd = addDays(now, 7);
  const byDue = [...tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  const groups: AgendaGroup[] = [
    { id: "overdue", label: "Overdue", tasks: [] },
    { id: "today", label: "Today", tasks: [] },
    { id: "tomorrow", label: "Tomorrow", tasks: [] },
    { id: "week", label: "Next 7 days", tasks: [] },
    { id: "later", label: "Later", tasks: [] },
    { id: "done", label: "Completed", tasks: [] },
  ];
  const find = (id: AgendaGroup["id"]) => groups.find((g) => g.id === id)!;
  for (const task of byDue) {
    const day = dayKey(task.dueAt);
    if (task.status === "done") find("done").tasks.push(task);
    else if (isOverdue(task, now)) find("overdue").tasks.push(task);
    else if (day === today) find("today").tasks.push(task);
    else if (day === tomorrow) find("tomorrow").tasks.push(task);
    else if (day <= weekEnd) find("week").tasks.push(task);
    else find("later").tasks.push(task);
  }
  find("done").tasks.reverse();
  return groups.filter((group) => group.tasks.length > 0);
}

export function summarizeTasks(tasks: TaskItem[], now: string) {
  const today = dayKey(now);
  const open = tasks.filter((t) => t.status !== "done");
  const weekAgo = new Date(new Date(now).getTime() - 7 * 86_400_000).getTime();
  return {
    dueToday: open.filter((t) => dayKey(t.dueAt) === today).length,
    overdue: open.filter((t) => isOverdue(t, now)).length,
    highPriority: open.filter((t) => t.priority === "high").length,
    completedThisWeek: tasks.filter((t) => t.completedAt && new Date(t.completedAt).getTime() >= weekAgo).length,
  };
}

/** Next seven days starting today, with open-task counts, for the day strip. */
export function weekStrip(tasks: TaskItem[], now: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(now, i);
    const dayTasks = tasks.filter((t) => dayKey(t.dueAt) === key);
    return {
      key,
      iso: new Date(new Date(now).getTime() + i * 86_400_000).toISOString(),
      open: dayTasks.filter((t) => t.status !== "done").length,
      high: dayTasks.filter((t) => t.status !== "done" && t.priority === "high").length,
    };
  });
}
