"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/shared/form-field";
import { LEAD_INTENTS, LEAD_INTENT_LABELS, LEAD_PRIORITIES, LEAD_PRIORITY_LABELS, type LeadSource } from "@/domain/lead";
import type { AgentOption } from "@/features/workspace/types";
import { formatPKRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { leadFormDefaults, leadFormSchema, type LeadFormInput, type LeadFormValues } from "../lib/lead-schema";
import { priorityMeta } from "./lead-badges";

const UNASSIGNED_VALUE = "__unassigned";

function BudgetHint({ raw, suffix }: { raw: string; suffix: string }) {
  const value = Number(raw.replace(/,/g, ""));
  if (!raw || !Number.isFinite(value) || value <= 0) return <>In rupees, e.g. 45000000</>;
  return <>≈ {formatPKRCompact(value)}{suffix}</>;
}

interface AddLeadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AgentOption[];
  sources: LeadSource[];
  onCreate: (values: LeadFormValues) => void;
}

export function AddLeadSheet({ open, onOpenChange, agents, sources, onCreate }: AddLeadSheetProps) {
  const form = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaults,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;
  const [intent, budgetMin, budgetMax] = useWatch({ control, name: ["intent", "budgetMin", "budgetMax"] });
  const rentSuffix = intent === "rent" ? " per month" : "";

  const close = (next: boolean) => {
    if (!next) reset(leadFormDefaults);
    onOpenChange(next);
  };

  const submit = handleSubmit((values) => {
    onCreate(values);
    close(false);
  });

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:w-full sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-base">Add lead</SheetTitle>
          <SheetDescription>Capture a new inquiry and route it to an agent.</SheetDescription>
        </SheetHeader>

        <form id="add-lead-form" onSubmit={submit} noValidate className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            <FormSection title="Client" description="Who is inquiring and how to reach them.">
              <FormField id="lead-name" label="Full name" required error={errors.name?.message}>
                {(a11y) => <Input {...a11y} autoComplete="off" placeholder="e.g. Kashif Mehmood" {...register("name")} />}
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="lead-phone" label="Mobile number" required error={errors.phone?.message} hint="Pakistani mobile, e.g. 0300 1234567">
                  {(a11y) => <Input {...a11y} type="tel" inputMode="tel" placeholder="03XX XXXXXXX" {...register("phone")} />}
                </FormField>
                <FormField id="lead-email" label="Email" error={errors.email?.message}>
                  {(a11y) => <Input {...a11y} type="email" placeholder="name@example.com" {...register("email")} />}
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Requirement" description="What the client wants and can afford.">
              <div className="flex flex-col gap-1.5">
                <span id="lead-intent-label" className="text-[13px] font-medium text-foreground">
                  Intent <span className="text-danger" aria-hidden>*</span>
                </span>
                <Controller
                  control={control}
                  name="intent"
                  render={({ field }) => (
                    <RadioGroup aria-labelledby="lead-intent-label" value={field.value} onValueChange={field.onChange} className="grid grid-cols-3 gap-2">
                      {LEAD_INTENTS.map((value) => (
                        <label
                          key={value}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-muted/60",
                            field.value === value && "border-primary bg-brand-soft text-brand",
                          )}
                        >
                          <RadioGroupItem value={value} />
                          {LEAD_INTENT_LABELS[value]}
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="lead-interest" label="Looking for" required error={errors.interest?.message}>
                  {(a11y) => <Input {...a11y} placeholder="e.g. 10 Marla house" {...register("interest")} />}
                </FormField>
                <FormField id="lead-location" label="Preferred area" required error={errors.location?.message}>
                  {(a11y) => <Input {...a11y} placeholder="e.g. DHA Phase 6, Lahore" {...register("location")} />}
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="lead-budget-min"
                  label={`Min budget (PKR${rentSuffix ? "/mo" : ""})`}
                  required
                  error={errors.budgetMin?.message}
                  hint={<BudgetHint raw={budgetMin} suffix={rentSuffix} />}
                >
                  {(a11y) => <Input {...a11y} inputMode="numeric" placeholder="35000000" {...register("budgetMin")} />}
                </FormField>
                <FormField
                  id="lead-budget-max"
                  label={`Max budget (PKR${rentSuffix ? "/mo" : ""})`}
                  required
                  error={errors.budgetMax?.message}
                  hint={<BudgetHint raw={budgetMax} suffix={rentSuffix} />}
                >
                  {(a11y) => <Input {...a11y} inputMode="numeric" placeholder="42000000" {...register("budgetMax")} />}
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Routing" description="Where it came from and who owns it.">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="lead-source" label="Source" required>
                  {(a11y) => (
                    <Controller
                      control={control}
                      name="sourceId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger {...a11y} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {sources.map((source) => (
                              <SelectItem key={source.id} value={source.id}>
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
                <FormField id="lead-priority" label="Priority" required>
                  {(a11y) => (
                    <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger {...a11y} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {LEAD_PRIORITIES.map((priority) => {
                              const Icon = priorityMeta[priority].icon;
                              return (
                                <SelectItem key={priority} value={priority}>
                                  <Icon className={priorityMeta[priority].className} aria-hidden />
                                  {LEAD_PRIORITY_LABELS[priority]}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
              </div>
              <FormField id="lead-agent" label="Assign to" hint="Leave unassigned to place it in the team queue.">
                {(a11y) => (
                  <Controller
                    control={control}
                    name="assignedToId"
                    render={({ field }) => (
                      <Select value={field.value || UNASSIGNED_VALUE} onValueChange={(value) => field.onChange(value === UNASSIGNED_VALUE ? "" : value)}>
                        <SelectTrigger {...a11y} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value={UNASSIGNED_VALUE}>Unassigned (team queue)</SelectItem>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                              <span className="text-muted-foreground">· {agent.openLeads} open</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField id="lead-notes" label="Notes" error={errors.notes?.message}>
                {(a11y) => <Textarea {...a11y} rows={3} placeholder="Anything the agent should know before calling" {...register("notes")} />}
              </FormField>
            </FormSection>
          </div>
        </form>

        <SheetFooter className="flex-row items-center justify-between gap-3 border-t px-6 py-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FlaskConical className="size-3.5 shrink-0" aria-hidden />
            Demo: kept for this session only
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-lead-form" disabled={isSubmitting}>
              Add lead
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
