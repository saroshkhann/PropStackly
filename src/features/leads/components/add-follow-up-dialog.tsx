"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import type { AgentOption } from "@/features/workspace/types";
import { dayKey } from "@/lib/format";
import { followUpSchema, type FollowUpValues } from "../lib/detail-schemas";

interface AddFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AgentOption[];
  defaultAgentId: string | null;
  now: string;
  onCreate: (values: FollowUpValues) => void;
}

const channelLabels: Record<FollowUpValues["channel"], string> = {
  call: "Phone call",
  whatsapp: "WhatsApp",
  meeting: "In-person meeting",
  email: "Email",
};

export function AddFollowUpDialog({ open, onOpenChange, agents, defaultAgentId, now, onCreate }: AddFollowUpDialogProps) {
  const defaults: FollowUpValues = {
    kind: "follow_up",
    title: "",
    date: dayKey(new Date(new Date(now).getTime() + 86_400_000).toISOString()),
    time: "11:00",
    channel: "call",
    location: "",
    assignedToId: defaultAgentId ?? "",
    priority: "normal",
  };
  const { register, control, handleSubmit, reset, formState } = useForm<FollowUpValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const { errors } = formState;
  const kind = useWatch({ control, name: "kind" });

  const close = (next: boolean) => {
    if (!next) reset(defaults);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule follow-up</DialogTitle>
          <DialogDescription>Set a reminder or book a site visit. Times are in Pakistan Standard Time.</DialogDescription>
        </DialogHeader>
        <form
          id="follow-up-form"
          noValidate
          onSubmit={handleSubmit((values) => {
            onCreate(values);
            close(false);
          })}
          className="grid gap-4 sm:grid-cols-2"
        >
          <FormField id="fu-kind" label="Type" required>
            {(a11y) => (
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="site_visit">Site visit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          {kind === "follow_up" ? (
            <FormField id="fu-channel" label="Channel" required>
              {(a11y) => (
                <Controller
                  control={control}
                  name="channel"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper">
                        {Object.entries(channelLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>
          ) : (
            <FormField id="fu-location" label="Property address" required error={errors.location?.message}>
              {(a11y) => <Input {...a11y} placeholder="e.g. Street 12, DHA Phase 5" {...register("location")} />}
            </FormField>
          )}
          <FormField id="fu-title" label="Title" required error={errors.title?.message} className="sm:col-span-2">
            {(a11y) => <Input {...a11y} placeholder={kind === "site_visit" ? "e.g. 1 Kanal house viewing" : "e.g. Share revised payment plan"} {...register("title")} />}
          </FormField>
          <FormField id="fu-date" label="Date" required error={errors.date?.message}>
            {(a11y) => <Input {...a11y} type="date" min={dayKey(now)} {...register("date")} />}
          </FormField>
          <FormField id="fu-time" label="Time" required error={errors.time?.message}>
            {(a11y) => <Input {...a11y} type="time" step={900} {...register("time")} />}
          </FormField>
          <FormField id="fu-agent" label="Assigned to" required error={errors.assignedToId?.message}>
            {(a11y) => (
              <Controller
                control={control}
                name="assignedToId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a11y} className="w-full"><SelectValue placeholder="Choose an agent" /></SelectTrigger>
                    <SelectContent position="popper">
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField id="fu-priority" label="Priority" required>
            {(a11y) => (
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
        </form>
        <DialogFooter className="items-center sm:justify-between">
          <p className="text-xs text-muted-foreground max-sm:order-last">Demo: reminders aren&apos;t sent yet.</p>
          <div className="flex gap-2 max-sm:w-full max-sm:*:flex-1">
            <Button type="button" variant="outline" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" form="follow-up-form">Schedule</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
