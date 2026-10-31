"use client";

import { Check, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentChip } from "@/components/shared/agent-chip";
import { isOverdue, TASK_TYPE_LABELS, type TaskStatus } from "@/domain/task";
import { LeadPeek } from "@/features/leads/components/lead-peek";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TaskItem } from "../data/types";
import { PriorityFlag, taskTypeIcons } from "./task-meta";

interface TaskRowProps {
  task: TaskItem;
  now: string;
  onToggleDone: (task: TaskItem) => void;
  onStatus: (task: TaskItem, status: TaskStatus) => void;
  onEdit: (task: TaskItem) => void;
}

export function TaskRow({ task, now, onToggleDone, onStatus, onEdit }: TaskRowProps) {
  const done = task.status === "done";
  const overdue = isOverdue(task, now);
  const Icon = taskTypeIcons[task.type];

  return (
    <li className={cn("group/task flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5", overdue && "bg-danger-soft/30")}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Reopen "${task.title}"` : `Complete "${task.title}"`}
        onClick={() => onToggleDone(task)}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          done && "border-success bg-success text-white hover:border-success",
          overdue && "border-danger/60",
        )}
      >
        {done && <Check className="size-3" aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => onEdit(task)} className="block max-w-full text-left focus-visible:underline focus-visible:outline-none">
          <span className={cn("flex items-center gap-2 text-[13.5px] font-medium text-foreground", done && "text-muted-foreground line-through")}>
            <span className="truncate">{task.title}</span>
            <PriorityFlag priority={task.priority} />
            {task.status === "in_progress" && <span className="shrink-0 rounded-md bg-info-soft px-1.5 py-px text-[10.5px] font-semibold text-info no-underline">In progress</span>}
            {(task.isDraft || task.hasLocalEdits) && (
              <span className="shrink-0 rounded-full border border-dashed border-warning/40 px-1.5 text-[10.5px] font-medium text-warning">{task.isDraft ? "Draft" : "Edited"}</span>
            )}
          </span>
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className={cn("flex items-center gap-1 tabular", overdue && "font-medium text-danger")} title={formatDate(task.dueAt, "dateTime")}>
            <Icon className="size-3.5" aria-hidden />
            {TASK_TYPE_LABELS[task.type]} · {formatDate(task.dueAt, "time")}
            {overdue && ` · ${formatRelative(task.dueAt, now).replace(" ago", "")} late`}
          </span>
          {task.lead && <LeadPeek lead={task.lead} />}
          {task.notes && <span className="max-w-[22rem] truncate max-md:hidden">{task.notes}</span>}
        </div>
      </div>

      <AgentChip name={task.assignee?.name ?? null} short className="mt-0.5 shrink-0 text-xs max-sm:hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="-mt-0.5 text-muted-foreground" aria-label={`Actions for ${task.title}`}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => onEdit(task)}>Edit task</DropdownMenuItem>
          <DropdownMenuSeparator />
          {task.status !== "todo" && <DropdownMenuItem onSelect={() => onStatus(task, "todo")}>Mark to do</DropdownMenuItem>}
          {task.status !== "in_progress" && <DropdownMenuItem onSelect={() => onStatus(task, "in_progress")}>Mark in progress</DropdownMenuItem>}
          {task.status !== "done" && <DropdownMenuItem onSelect={() => onStatus(task, "done")}>Mark done</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
