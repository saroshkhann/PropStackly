"use client";

import { Check, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface FacetOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface FacetFilterProps<T extends string> {
  title: string;
  options: FacetOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  searchable?: boolean;
}

export function FacetFilter<T extends string>({ title, options, selected, onChange, searchable = false }: FacetFilterProps<T>) {
  const toggle = (value: T) =>
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  const selectedLabels = options.filter((option) => selected.includes(option.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("border-dashed", selected.length && "border-solid")}>
          <PlusCircle className="text-muted-foreground" />
          {title}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4!" />
              <span className="rounded-md bg-brand-soft px-1.5 text-xs font-semibold text-brand lg:hidden">{selected.length}</span>
              <span className="hidden gap-1 lg:flex">
                {selected.length > 2 ? (
                  <span className="rounded-md bg-brand-soft px-1.5 text-xs font-medium text-brand">{selected.length} selected</span>
                ) : (
                  selectedLabels.map((option) => (
                    <span key={option.value} className="rounded-md bg-brand-soft px-1.5 text-xs font-medium text-brand">
                      {option.label}
                    </span>
                  ))
                )}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          {searchable && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border border-border-strong",
                        isSelected && "border-primary bg-primary text-primary-foreground",
                      )}
                      aria-hidden
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto text-xs text-muted-foreground tabular">{option.count}</span>
                    )}
                    <span className="sr-only">{isSelected ? "(selected)" : ""}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
