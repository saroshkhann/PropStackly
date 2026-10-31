"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, TASK_STATUSES, TASK_STATUS_LABELS, TASK_TYPES, TASK_TYPE_LABELS } from "@/domain/task";
import type { LeadPeekData } from "@/features/leads/components/lead-peek";
import type { AgentOption } from "@/features/workspace/types";
import type { TaskItem } from "../data/types";
import { taskFormSchema, taskToFormValues, type TaskFormValues } from "../lib/task-schema";
import { taskTypeIcons } from "./task-meta";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskItem | null;
  defaults: Partial<TaskFormValues>;
  agents: AgentOption[];
  leads: LeadPeekData[];
  now: string;
  onSubmit: (values: TaskFormValues) => void;
}

export function TaskDialog(props: TaskDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">{props.open && <TaskForm {...props} />}</DialogContent>
    </Dialog>
  );
}

function TaskForm({ onOpenChange, task, defaults, agents, leads, now, onSubmit }: TaskDialogProps) {
  const { register, control, handleSubmit, formState } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskToFormValues(task, now, defaults),
    mode: "onTouched",
  });
  const { errors } = formState;

  const select = <K extends "type" | "priority" | "status" | "assignedToId">(name: K, options: { value: string; label: React.ReactNode }[], id: string, label: string, placeholder?: string) => (
    <FormField id={id} label={label} required error={errors[name]?.message}>
      {(a11y) => (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger {...a11y} className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
              <SelectContent position="popper">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </FormField>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        <DialogDescription>Follow-ups, paperwork, and reminders. Times are in Pakistan Standard Time.</DialogDescription>
      </DialogHeader>
      <form
        id="task-form"
        noValidate
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
          onOpenChange(false);
        })}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField id="task-title" label="Task" required error={errors.title?.message} className="sm:col-span-2">
          {(a11y) => <Input {...a11y} placeholder="e.g. Call to confirm token amount" {...register("title")} />}
        </FormField>
        {select(
          "type",
          TASK_TYPES.map((type) => {
            const Icon = taskTypeIcons[type];
            return { value: type, label: <><Icon aria-hidden />{TASK_TYPE_LABELS[type]}</> };
          }),
          "task-type",
          "Type",
        )}
        {select("priority", TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_LABELS[p] })), "task-priority", "Priority")}
        <FormField id="task-date" label="Due date" required error={errors.date?.message}>
          {(a11y) => <Input {...a11y} type="date" {...register("date")} />}
        </FormField>
        <FormField id="task-time" label="Time" required error={errors.time?.message}>
          {(a11y) => <Input {...a11y} type="time" step={900} {...register("time")} />}
        </FormField>
        {select("assignedToId", agents.map((a) => ({ value: a.id, label: a.name })), "task-assignee", "Assigned to", "Choose a teammate")}
        {select("status", TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] })), "task-status", "Status")}
        <FormField id="task-lead" label="Related lead" className="sm:col-span-2">
          {(a11y) => (
            <Controller
              control={control}
              name="leadId"
              render={({ field }) => (
                <SearchableSelect
                  control={a11y}
                  value={field.value}
                  onChange={field.onChange}
                  options={leads.map((lead) => ({ value: lead.id, label: lead.name, description: `${lead.interest} · ${lead.phoneMasked}` }))}
                  placeholder="Link a lead (optional)"
                  searchPlaceholder="Search leads…"
                  emptyText="No matching lead."
                  clearable
                />
              )}
            />
          )}
        </FormField>
        <FormField id="task-notes" label="Notes" error={errors.notes?.message} className="sm:col-span-2">
          {(a11y) => <Textarea {...a11y} rows={3} {...register("notes")} />}
        </FormField>
      </form>
      <DialogFooter className="items-center sm:justify-between">
        <p className="text-xs text-muted-foreground max-sm:order-last">Demo: reminders aren&apos;t sent yet.</p>
        <div className="flex gap-2 max-sm:w-full max-sm:*:flex-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="task-form">{task ? "Save task" : "Create task"}</Button>
        </div>
      </DialogFooter>
    </>
  );
}
