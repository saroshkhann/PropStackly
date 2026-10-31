"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormSection } from "@/components/shared/form-field";
import { AREA_UNITS, AREA_UNIT_LABELS } from "@/domain/area";
import { PROPERTY_AMENITIES, PROPERTY_FEATURES } from "@/domain/property";
import type { AgentOption } from "@/features/workspace/types";
import { formatPKRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyListItem } from "../data/types";
import { emptyPropertyFilters, filterProperties, UNASSIGNED, type PropertyFilters } from "../lib/property-filters";
import { SegmentedControl } from "./segmented-control";

const salePresets = [
  { label: "Under 1 Cr", min: null, max: 10_000_000 },
  { label: "1–3 Cr", min: 10_000_000, max: 30_000_000 },
  { label: "3–7 Cr", min: 30_000_000, max: 70_000_000 },
  { label: "7 Cr+", min: 70_000_000, max: null },
];
const rentPresets = [
  { label: "Under 1 Lac", min: null, max: 100_000 },
  { label: "1–2.5 Lac", min: 100_000, max: 250_000 },
  { label: "2.5 Lac+", min: 250_000, max: null },
];

function parseAmount(raw: string) {
  const digits = raw.replace(/[^\d.]/g, "");
  return digits ? Number(digits) : null;
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected && "border-primary bg-brand-soft text-brand hover:bg-brand-soft",
      )}
    >
      {selected && <Check className="size-3" aria-hidden />}
      {children}
    </button>
  );
}

interface AdvancedFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
  properties: PropertyListItem[];
  agents: AgentOption[];
}

export function AdvancedFiltersSheet(props: AdvancedFiltersSheetProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:w-full sm:max-w-md">
        {props.open && <AdvancedFiltersBody {...props} />}
      </SheetContent>
    </Sheet>
  );
}

function AdvancedFiltersBody({ onOpenChange, filters, onApply, properties, agents }: AdvancedFiltersSheetProps) {
  const [draft, setDraft] = useState<PropertyFilters>(filters);
  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const toggle = (key: "agents" | "features", value: string) =>
    set(key, draft[key].includes(value) ? draft[key].filter((v) => v !== value) : [...draft[key], value]);
  const resultCount = filterProperties(properties, draft).length;
  const presets = draft.purpose === "rent" ? rentPresets : salePresets;

  return (
    <>
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle className="text-base">More filters</SheetTitle>
        <SheetDescription>Narrow listings by budget, size, rooms, and features.</SheetDescription>
      </SheetHeader>

      <div className="scrollbar-thin flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        <FormSection title="Category">
          <SegmentedControl
            label="Category"
            value={draft.category}
            onChange={(value) => set("category", value)}
            options={[
              { value: "all", label: "All" },
              { value: "residential", label: "Residential" },
              { value: "commercial", label: "Commercial" },
            ]}
          />
        </FormSection>

        <FormSection title={draft.purpose === "rent" ? "Monthly rent (PKR)" : "Price (PKR)"}>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <Chip
                key={preset.label}
                selected={draft.priceMin === preset.min && draft.priceMax === preset.max}
                onClick={() => setDraft((current) => ({ ...current, priceMin: preset.min, priceMax: preset.max }))}
              >
                {preset.label}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["priceMin", "priceMax"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={`filter-${key}`} className="text-xs text-muted-foreground">
                  {key === "priceMin" ? "Minimum" : "Maximum"}
                </Label>
                <Input
                  id={`filter-${key}`}
                  inputMode="numeric"
                  placeholder={key === "priceMin" ? "No min" : "No max"}
                  value={draft[key] ?? ""}
                  onChange={(event) => set(key, parseAmount(event.target.value))}
                  aria-describedby={`filter-${key}-hint`}
                />
                <span id={`filter-${key}-hint`} className="text-[11px] text-muted-foreground tabular">
                  {draft[key] ? `≈ ${formatPKRCompact(draft[key])}` : "Any"}
                </span>
              </div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Area">
          <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            {(["areaMin", "areaMax"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={`filter-${key}`} className="text-xs text-muted-foreground">
                  {key === "areaMin" ? "Min" : "Max"}
                </Label>
                <Input
                  id={`filter-${key}`}
                  inputMode="decimal"
                  placeholder="Any"
                  value={draft[key] ?? ""}
                  onChange={(event) => set(key, parseAmount(event.target.value))}
                />
              </div>
            ))}
            <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
              <Label htmlFor="filter-area-unit" className="text-xs text-muted-foreground">
                Unit
              </Label>
              <Select value={draft.areaUnit} onValueChange={(value) => set("areaUnit", value as PropertyFilters["areaUnit"])}>
                <SelectTrigger id="filter-area-unit" className="w-full sm:w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {AREA_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {AREA_UNIT_LABELS[unit].long}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Bedrooms">
          <SegmentedControl
            label="Minimum bedrooms"
            value={draft.minBedrooms === null ? "any" : String(draft.minBedrooms)}
            onChange={(value) => set("minBedrooms", value === "any" ? null : Number(value))}
            options={[{ value: "any", label: "Any" }, ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` }))]}
          />
        </FormSection>

        <FormSection title="Assigned agent">
          <div className="flex flex-wrap gap-1.5">
            {agents.map((agent) => (
              <Chip key={agent.id} selected={draft.agents.includes(agent.id)} onClick={() => toggle("agents", agent.id)}>
                {agent.name}
              </Chip>
            ))}
            <Chip selected={draft.agents.includes(UNASSIGNED)} onClick={() => toggle("agents", UNASSIGNED)}>
              Unassigned
            </Chip>
          </div>
        </FormSection>

        <FormSection title="Features & amenities" description="Listings must have every selected item.">
          <div className="flex flex-wrap gap-1.5">
            {[...PROPERTY_FEATURES, ...PROPERTY_AMENITIES].map((feature) => (
              <Chip key={feature} selected={draft.features.includes(feature)} onClick={() => toggle("features", feature)}>
                {feature}
              </Chip>
            ))}
          </div>
        </FormSection>
      </div>

      <SheetFooter className="flex-row justify-between gap-3 border-t px-6 py-4">
        <Button
          variant="ghost"
          onClick={() =>
            setDraft((current) => ({
              ...emptyPropertyFilters,
              query: current.query,
              purpose: current.purpose,
              types: current.types,
              statuses: current.statuses,
              locations: current.locations,
            }))
          }
        >
          Clear these
        </Button>
        <Button
          onClick={() => {
            onApply(draft);
            onOpenChange(false);
          }}
        >
          Show {resultCount} {resultCount === 1 ? "listing" : "listings"}
        </Button>
      </SheetFooter>
    </>
  );
}
