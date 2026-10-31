"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/shared/form-field";
import { CONTACT_TYPES, CONTACT_TYPE_LABELS, type Contact } from "@/domain/contact";
import type { AgentOption } from "@/features/workspace/types";
import { cn } from "@/lib/utils";
import { contactEditSchema, contactFormDefaults, contactFormSchema, contactToFormValues, type ContactFormValues } from "../lib/contact-schema";

interface ContactFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: AgentOption[];
  /** When provided the sheet edits this contact; otherwise it creates a new one. */
  contact?: Contact;
  onSubmit: (values: ContactFormValues) => void;
}

export function ContactFormSheet({ open, onOpenChange, agents, contact, onSubmit }: ContactFormSheetProps) {
  const editing = Boolean(contact);
  const defaults = contact ? contactToFormValues(contact) : contactFormDefaults;
  const { register, control, handleSubmit, reset, formState } = useForm<ContactFormValues>({
    resolver: zodResolver(editing ? contactEditSchema : contactFormSchema),
    values: open ? defaults : undefined,
    mode: "onTouched",
  });
  const { errors } = formState;

  const close = (next: boolean) => {
    if (!next) reset(defaults);
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:w-full sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-base">{editing ? `Edit ${contact?.name}` : "Add contact"}</SheetTitle>
          <SheetDescription>
            {editing ? "Update details, roles, and ownership." : "Add a buyer, seller, landlord, tenant, or investor to your directory."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="contact-form"
          noValidate
          onSubmit={handleSubmit((values) => {
            onSubmit(values);
            close(false);
          })}
          className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5"
        >
          <div className="flex flex-col gap-6">
            <FormSection title="Identity">
              <FormField id="contact-name" label="Full name" required error={errors.name?.message}>
                {(a11y) => <Input {...a11y} autoComplete="off" placeholder="e.g. Saima Nawaz or Ghulam Mustafa Traders" {...register("name")} />}
              </FormField>
              <div className="flex flex-col gap-1.5">
                <span id="contact-types-label" className="text-[13px] font-medium">
                  Roles <span className="text-danger" aria-hidden>*</span>
                </span>
                <Controller
                  control={control}
                  name="types"
                  render={({ field }) => (
                    <div
                      role="group"
                      aria-labelledby="contact-types-label"
                      aria-describedby={errors.types ? "contact-types-error" : undefined}
                      className="flex flex-wrap gap-2"
                    >
                      {CONTACT_TYPES.map((type) => {
                        const checked = field.value.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => field.onChange(checked ? field.value.filter((t) => t !== type) : [...field.value, type])}
                            className={cn(
                              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                              checked && "border-primary bg-brand-soft text-brand hover:bg-brand-soft",
                            )}
                          >
                            {checked && <Check className="size-3.5" aria-hidden />}
                            {CONTACT_TYPE_LABELS[type]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.types && (
                  <p id="contact-types-error" role="alert" className="text-xs font-medium text-danger">
                    {errors.types.message}
                  </p>
                )}
              </div>
              <FormField id="contact-occupation" label="Occupation or company type" error={errors.occupation?.message}>
                {(a11y) => <Input {...a11y} placeholder="e.g. Doctor, Builder, Overseas (Dubai)" {...register("occupation")} />}
              </FormField>
            </FormSection>

            <FormSection title="Contact details">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="contact-phone"
                  label="Mobile number"
                  required={!editing}
                  error={errors.phone?.message}
                  hint={editing ? `Leave blank to keep ${contact?.phoneMasked}` : "e.g. 0300 1234567"}
                >
                  {(a11y) => <Input {...a11y} type="tel" inputMode="tel" placeholder="03XX XXXXXXX" {...register("phone")} />}
                </FormField>
                <FormField id="contact-email" label="Email" error={errors.email?.message}>
                  {(a11y) => <Input {...a11y} type="email" placeholder="name@example.com" {...register("email")} />}
                </FormField>
              </div>
              <Controller
                control={control}
                name="hasWhatsApp"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox id="contact-whatsapp" checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                    <Label htmlFor="contact-whatsapp" className="text-[13px] font-normal">
                      This number is on WhatsApp
                    </Label>
                  </div>
                )}
              />
              <FormField id="contact-area" label="Area or society" required error={errors.area?.message} hint="City is Lahore for this agency.">
                {(a11y) => <Input {...a11y} placeholder="e.g. DHA Phase 6" {...register("area")} />}
              </FormField>
            </FormSection>

            <FormSection title="Ownership & notes">
              <FormField id="contact-owner" label="Managed by" required error={errors.ownerId?.message}>
                {(a11y) => (
                  <Controller
                    control={control}
                    name="ownerId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger {...a11y} className="w-full">
                          <SelectValue placeholder="Choose a team member" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                              <span className="text-muted-foreground">· {agent.title}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField id="contact-tags" label="Tags" error={errors.tags?.message} hint="Comma separated, e.g. Overseas Pakistani, Cash buyer">
                {(a11y) => <Input {...a11y} {...register("tags")} />}
              </FormField>
              <FormField id="contact-notes" label="Notes" error={errors.notes?.message}>
                {(a11y) => <Textarea {...a11y} rows={3} placeholder="Preferences, family decision-makers, documents…" {...register("notes")} />}
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
            <Button type="submit" form="contact-form">
              {editing ? "Save changes" : "Add contact"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
