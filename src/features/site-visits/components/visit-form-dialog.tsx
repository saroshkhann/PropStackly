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
import type { LeadPeekData } from "@/features/leads/components/lead-peek";
import type { AgentOption } from "@/features/workspace/types";
import { dayKey } from "@/lib/format";
import type { VisitItem, VisitPropertyRef } from "../data/types";
import { visitFormSchema, visitToFormValues, type VisitFormValues } from "../lib/visit-schema";

interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: VisitItem | null;
  defaultDate: string | undefined;
  agents: AgentOption[];
  leads: LeadPeekData[];
  properties: VisitPropertyRef[];
  now: string;
  onSubmit: (values: VisitFormValues) => void;
}

export function VisitFormDialog(props: VisitFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">{props.open && <VisitForm {...props} />}</DialogContent>
    </Dialog>
  );
}

function VisitForm({ onOpenChange, visit, defaultDate, agents, leads, properties, now, onSubmit }: VisitFormDialogProps) {
  const { register, control, handleSubmit, setValue, getValues, formState } = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: visitToFormValues(visit, now, defaultDate),
    mode: "onTouched",
  });
  const { errors } = formState;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{visit ? "Reschedule site visit" : "Schedule site visit"}</DialogTitle>
        <DialogDescription>Times are in Pakistan Standard Time. The client isn&apos;t notified in this prototype.</DialogDescription>
      </DialogHeader>
      <form
        id="visit-form"
        noValidate
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
          onOpenChange(false);
        })}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField id="visit-lead" label="Customer" required error={errors.leadId?.message} className="sm:col-span-2">
          {(a11y) => (
            <Controller
              control={control}
              name="leadId"
              render={({ field }) => (
                <SearchableSelect
                  control={a11y}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(leadId) => {
                    field.onChange(leadId);
                    const agentName = leads.find((l) => l.id === leadId)?.agentName;
                    const agent = agents.find((a) => a.name === agentName);
                    if (agent && !getValues("assignedToId")) setValue("assignedToId", agent.id, { shouldValidate: true });
                  }}
                  options={leads.map((l) => ({ value: l.id, label: l.name, description: `${l.interest} · ${l.phoneMasked}` }))}
                  placeholder="Choose a lead…"
                  searchPlaceholder="Search leads…"
                  emptyText="No matching lead."
                />
              )}
            />
          )}
        </FormField>
        <FormField id="visit-property" label="Property" required error={errors.propertyId?.message} className="sm:col-span-2">
          {(a11y) => (
            <Controller
              control={control}
              name="propertyId"
              render={({ field }) => (
                <SearchableSelect
                  control={a11y}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(propertyId) => {
                    field.onChange(propertyId);
                    const property = properties.find((p) => p.id === propertyId);
                    if (property && !getValues("meetingPoint")) setValue("meetingPoint", `${property.address}, ${property.location}`, { shouldValidate: true });
                  }}
                  options={properties.map((p) => ({ value: p.id, label: p.title, description: `${p.location} · ${p.address}` }))}
                  placeholder="Choose a listing…"
                  searchPlaceholder="Search listings…"
                  emptyText="No matching listing."
                />
              )}
            />
          )}
        </FormField>
        <FormField id="visit-date" label="Date" required error={errors.date?.message}>
          {(a11y) => <Input {...a11y} type="date" min={visit ? undefined : dayKey(now)} {...register("date")} />}
        </FormField>
        <FormField id="visit-time" label="Time" required error={errors.time?.message}>
          {(a11y) => <Input {...a11y} type="time" step={900} {...register("time")} />}
        </FormField>
        <FormField id="visit-duration" label="Duration" required>
          {(a11y) => (
            <Controller
              control={control}
              name="durationMinutes"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    {["30", "45", "60", "90"].map((m) => (
                      <SelectItem key={m} value={m}>{m} minutes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
        <FormField id="visit-agent" label="Agent" required error={errors.assignedToId?.message}>
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
        <FormField id="visit-meeting" label="Meeting point" required error={errors.meetingPoint?.message} className="sm:col-span-2">
          {(a11y) => <Input {...a11y} placeholder="e.g. Main gate, Street 12, DHA Phase 5" {...register("meetingPoint")} />}
        </FormField>
        <FormField id="visit-priority" label="Priority" required>
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
        <FormField id="visit-form-notes" label="Notes" error={errors.notes?.message} className="sm:col-span-2">
          {(a11y) => <Textarea {...a11y} rows={3} placeholder="Keys with the guard, family joining, parking…" {...register("notes")} />}
        </FormField>
      </form>
      <DialogFooter className="items-center sm:justify-between">
        <p className="text-xs text-muted-foreground max-sm:order-last">Demo: kept for this session only.</p>
        <div className="flex gap-2 max-sm:w-full max-sm:*:flex-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="visit-form">{visit ? "Save changes" : "Schedule visit"}</Button>
        </div>
      </DialogFooter>
    </>
  );
}
