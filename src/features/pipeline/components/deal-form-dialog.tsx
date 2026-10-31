"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { LOST_REASONS, type PipelineStage } from "@/domain/deal";
import type { AgentOption } from "@/features/workspace/types";
import { formatPKRCompact } from "@/lib/format";
import type { DealItem, DealPropertyRef, LeadOption } from "../data/types";
import { dealFormSchema, dealToFormInput, type DealFormInput, type DealFormValues } from "../lib/deal-schema";

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: DealItem | null;
  stages: PipelineStage[];
  agents: AgentOption[];
  leads: LeadOption[];
  properties: DealPropertyRef[];
  now: string;
  onSubmit: (values: DealFormValues) => void;
}

export function DealFormDialog(props: DealFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">{props.open && <DealFormBody {...props} />}</DialogContent>
    </Dialog>
  );
}

function DealFormBody({ onOpenChange, deal, stages, agents, leads, properties, now, onSubmit }: DealFormDialogProps) {
  const { register, control, handleSubmit, setValue, getValues, formState } = useForm<DealFormInput, unknown, DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: dealToFormInput(deal, now),
    mode: "onTouched",
  });
  const { errors } = formState;
  const [stageId, value, purpose] = useWatch({ control, name: ["stageId", "value", "purpose"] });
  const valueNumber = Number(String(value).replace(/,/g, ""));
  const defaultProbability = stages.find((s) => s.id === stageId)?.probability ?? 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{deal ? "Edit deal" : "New deal"}</DialogTitle>
        <DialogDescription>{deal ? "Update value, stage, and ownership." : "Track a sale or rental from first inquiry to transfer."}</DialogDescription>
      </DialogHeader>
      <form
        id="deal-form"
        noValidate
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
          onOpenChange(false);
        })}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField id="deal-lead" label="Linked lead" hint="Picking a lead fills in the customer.">
          {(a11y) => (
            <Controller
              control={control}
              name="leadId"
              render={({ field }) => (
                <SearchableSelect
                  control={a11y}
                  value={field.value}
                  onChange={(leadId) => {
                    field.onChange(leadId);
                    const lead = leads.find((l) => l.id === leadId);
                    if (lead) {
                      setValue("customerName", lead.name, { shouldValidate: true });
                      if (!getValues("title")) setValue("title", lead.interest, { shouldValidate: true });
                    }
                  }}
                  options={leads.map((l) => ({ value: l.id, label: l.name, description: `${l.interest} · ${l.phoneMasked}` }))}
                  placeholder="Search leads…"
                  searchPlaceholder="Search by name…"
                  emptyText="No matching lead."
                  clearable
                />
              )}
            />
          )}
        </FormField>
        <FormField id="deal-customer" label="Customer name" required error={errors.customerName?.message}>
          {(a11y) => <Input {...a11y} {...register("customerName")} />}
        </FormField>
        <FormField id="deal-title" label="Deal name" required error={errors.title?.message} className="sm:col-span-2">
          {(a11y) => <Input {...a11y} placeholder="e.g. 1 Kanal house · DHA Phase 6" {...register("title")} />}
        </FormField>
        <FormField id="deal-property" label="Property" className="sm:col-span-2">
          {(a11y) => (
            <Controller
              control={control}
              name="propertyId"
              render={({ field }) => (
                <SearchableSelect
                  control={a11y}
                  value={field.value}
                  onChange={(propertyId) => {
                    field.onChange(propertyId);
                    const property = properties.find((p) => p.id === propertyId);
                    if (property) {
                      setValue("purpose", property.purpose);
                      if (!getValues("value")) setValue("value", String(property.purpose === "rent" ? property.pricePKR * 12 : property.pricePKR), { shouldValidate: true });
                    }
                  }}
                  options={properties.map((p) => ({ value: p.id, label: p.title, description: `${p.location} · ${formatPKRCompact(p.pricePKR)}${p.purpose === "rent" ? "/mo" : ""}` }))}
                  placeholder="Link a listing (optional)"
                  searchPlaceholder="Search listings…"
                  emptyText="No matching listing."
                  clearable
                />
              )}
            />
          )}
        </FormField>
        <FormField id="deal-purpose" label="Deal type" required>
          {(a11y) => (
            <Controller
              control={control}
              name="purpose"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="rent">Rental (annual lease)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
        <FormField
          id="deal-value"
          label={purpose === "rent" ? "Annual lease value (PKR)" : "Deal value (PKR)"}
          required
          error={errors.value?.message}
          hint={valueNumber > 0 ? `≈ ${formatPKRCompact(valueNumber)}` : undefined}
        >
          {(a11y) => <Input {...a11y} inputMode="numeric" {...register("value")} />}
        </FormField>
        <FormField id="deal-stage" label="Stage" required>
          {(a11y) => (
            <Controller
              control={control}
              name="stageId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </FormField>
        {stageId === "closed_lost" ? (
          <FormField id="deal-lost-reason" label="Lost reason" required error={errors.lostReason?.message}>
            {(a11y) => (
              <Controller
                control={control}
                name="lostReason"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a11y} className="w-full"><SelectValue placeholder="Choose a reason" /></SelectTrigger>
                    <SelectContent position="popper">
                      {LOST_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
        ) : (
          <FormField id="deal-probability" label="Win probability (%)" error={errors.probability?.message} hint={`Stage default: ${Math.round(defaultProbability * 100)}%`}>
            {(a11y) => <Input {...a11y} inputMode="numeric" placeholder={String(Math.round(defaultProbability * 100))} {...register("probability")} />}
          </FormField>
        )}
        <FormField id="deal-close" label="Expected close date">
          {(a11y) => <Input {...a11y} type="date" {...register("expectedClose")} />}
        </FormField>
        <FormField id="deal-owner" label="Assigned agent" required error={errors.ownerId?.message}>
          {(a11y) => (
            <Controller
              control={control}
              name="ownerId"
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
        <FormField id="deal-notes" label="Notes" error={errors.notes?.message} className="sm:col-span-2">
          {(a11y) => <Textarea {...a11y} rows={3} placeholder="Terms discussed, token amount, transfer timeline…" {...register("notes")} />}
        </FormField>
      </form>
      <DialogFooter className="items-center sm:justify-between">
        <p className="text-xs text-muted-foreground max-sm:order-last">Demo: kept for this session only.</p>
        <div className="flex gap-2 max-sm:w-full max-sm:*:flex-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="deal-form">{deal ? "Save changes" : "Create deal"}</Button>
        </div>
      </DialogFooter>
    </>
  );
}
