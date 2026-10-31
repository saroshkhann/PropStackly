import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES } from "@/domain/task";
import { dayKey } from "@/lib/format";
import type { TaskItem } from "../data/types";

export const taskFormSchema = z.object({
  title: z.string().trim().min(3, "Describe the task in a few words").max(100),
  type: z.enum(TASK_TYPES),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  assignedToId: z.string().min(1, "Assign it to someone"),
  leadId: z.string(),
  notes: z.string().trim().max(500, "Keep notes under 500 characters"),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

function karachiTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Karachi" }).format(new Date(iso));
}

export function taskToFormValues(task: TaskItem | null, now: string, defaults: Partial<TaskFormValues> = {}): TaskFormValues {
  return {
    title: task?.title ?? "",
    type: task?.type ?? "call",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "todo",
    date: task ? dayKey(task.dueAt) : (defaults.date ?? dayKey(now)),
    time: task ? karachiTime(task.dueAt) : "15:00",
    assignedToId: task?.assignedToId ?? defaults.assignedToId ?? "",
    leadId: task?.leadId ?? "",
    notes: task?.notes ?? "",
  };
}
