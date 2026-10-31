"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageCircle, NotebookPen, Phone, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { NOTE_KINDS, noteSchema, type NoteValues } from "../lib/detail-schemas";

const kindMeta: Record<NoteValues["kind"], { label: string; icon: LucideIcon; placeholder: string }> = {
  note: { label: "Note", icon: NotebookPen, placeholder: "Add an internal note for the team…" },
  call: { label: "Call", icon: Phone, placeholder: "What was discussed on the call?" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, placeholder: "Summarise the WhatsApp conversation…" },
  email: { label: "Email", icon: Mail, placeholder: "Summarise the email…" },
};

interface NoteComposerProps {
  onSubmit: (values: NoteValues) => void;
  idPrefix: string;
  defaultKind?: NoteValues["kind"];
  autoFocus?: boolean;
}

export function NoteComposer({ onSubmit, idPrefix, defaultKind = "note", autoFocus = false }: NoteComposerProps) {
  const { control, register, handleSubmit, reset, formState } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { kind: defaultKind, body: "" },
  });
  const kind = useWatch({ control, name: "kind" });
  const error = formState.errors.body?.message;
  const textareaId = `${idPrefix}-note-body`;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
        reset({ kind: values.kind, body: "" });
      })}
      className="rounded-xl border bg-card shadow-card focus-within:border-ring/60 focus-within:ring-3 focus-within:ring-ring/15"
    >
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <div role="radiogroup" aria-label="Activity type" className="flex gap-1 border-b px-2 py-1.5">
            {NOTE_KINDS.map((value) => {
              const meta = kindMeta[value];
              const active = field.value === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => field.onChange(value)}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active && "bg-muted text-foreground",
                  )}
                >
                  <meta.icon className="size-3.5" aria-hidden />
                  {meta.label}
                </button>
              );
            })}
          </div>
        )}
      />
      <label htmlFor={textareaId} className="sr-only">
        {kindMeta[kind].label} details
      </label>
      <Textarea
        id={textareaId}
        rows={3}
        autoFocus={autoFocus}
        placeholder={kindMeta[kind].placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className="min-h-20 resize-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 dark:bg-transparent"
        {...register("body")}
      />
      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        {error ? (
          <p id={`${textareaId}-error`} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Demo: entries are kept for this session only.</p>
        )}
        <Button type="submit" size="sm">
          Log {kindMeta[kind].label.toLowerCase()}
        </Button>
      </div>
    </form>
  );
}
