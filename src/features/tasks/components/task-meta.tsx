import { Briefcase, FileText, Flag, Mail, MessageCircle, Phone, Users, type LucideIcon } from "lucide-react";
import { TASK_PRIORITY_LABELS, type TaskPriority, type TaskType } from "@/domain/task";
import { cn } from "@/lib/utils";

export const taskTypeIcons: Record<TaskType, LucideIcon> = {
  call: Phone,
  whatsapp: MessageCircle,
  meeting: Users,
  email: Mail,
  document: FileText,
  admin: Briefcase,
};

const priorityStyles: Record<TaskPriority, string> = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-subtle-foreground",
};

export function PriorityFlag({ priority, showLabel = false }: { priority: TaskPriority; showLabel?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", priorityStyles[priority])}>
      <Flag className={cn("size-3.5", priority === "high" && "fill-current")} aria-hidden />
      <span className={showLabel ? undefined : "sr-only"}>{TASK_PRIORITY_LABELS[priority]} priority</span>
    </span>
  );
}
