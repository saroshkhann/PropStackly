import type { TenantScoped } from "./tenancy";

export type TaskType = "call" | "whatsapp" | "meeting" | "email" | "document" | "admin";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  call: "Call",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
  email: "Email",
  document: "Paperwork",
  admin: "Admin",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TASK_TYPES = Object.keys(TASK_TYPE_LABELS) as TaskType[];
export const TASK_PRIORITIES = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];
export const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS) as TaskStatus[];

export interface Task extends TenantScoped {
  id: string;
  title: string;
  notes: string | null;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string;
  leadId: string | null;
  dealId: string | null;
  assignedToId: string;
  createdAt: string;
  completedAt: string | null;
}

export function isOverdue(task: Pick<Task, "status" | "dueAt">, now: string) {
  return task.status !== "done" && new Date(task.dueAt).getTime() < new Date(now).getTime();
}
