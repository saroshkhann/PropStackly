"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: React.ReactNode; title?: string }[];
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "default";
}

/** Single-choice button group; arrow keys move between options like a radio group. */
export function SegmentedControl<T extends string>({ label, value, options, onChange, className, size = "default" }: SegmentedControlProps<T>) {
  const move = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = options[(index + delta + options.length) % options.length]!;
    onChange(next.value);
    (event.currentTarget.parentElement?.children[(index + delta + options.length) % options.length] as HTMLElement | undefined)?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex items-center rounded-lg border bg-card p-0.5 shadow-card", size === "sm" ? "h-7" : "h-8", className)}>
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => move(event, index)}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
