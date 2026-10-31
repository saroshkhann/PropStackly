"use client";

import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FacetFilter } from "@/components/shared/facet-filter";
import { SearchInput } from "@/components/shared/search-input";
import { AREA_UNITS, AREA_UNIT_LABELS } from "@/domain/area";
import { PROPERTY_CATEGORY_LABELS, PROPERTY_STATUSES, PROPERTY_STATUS_LABELS, PROPERTY_TYPES, PROPERTY_TYPE_META, type AreaUnit } from "@/domain/property";
import type { AgentOption } from "@/features/workspace/types";
import { formatPKRCompact } from "@/lib/format";
import type { PropertyListItem } from "../data/types";
import { advancedFilterCount, emptyPropertyFilters, hasActivePropertyFilters, SORT_LABELS, UNASSIGNED, type PropertyFilters, type PropertySort } from "../lib/property-filters";
import { SegmentedControl } from "./segmented-control";

export type PropertyView = "grid" | "list";
/** "listed" shows each area in the unit the listing was entered in. */
export type DisplayUnit = AreaUnit | "listed";

interface PropertiesToolbarProps {
  properties: PropertyListItem[];
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  sort: PropertySort;
  onSort: (sort: PropertySort) => void;
  view: PropertyView;
  onView: (view: PropertyView) => void;
  unit: DisplayUnit;
  onUnit: (unit: DisplayUnit) => void;
  locations: string[];
  agents: AgentOption[];
  onOpenAdvanced: () => void;
}

function count<T>(items: PropertyListItem[], pick: (p: PropertyListItem) => T, value: T) {
  return items.filter((p) => pick(p) === value).length;
}

export function PropertiesToolbar(props: PropertiesToolbarProps) {
  const { properties, filters, onChange, sort, onSort, view, onView, unit, onUnit, locations, agents, onOpenAdvanced } = props;
  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => onChange({ ...filters, [key]: value });
  const advanced = advancedFilterCount(filters);
  const chips = activeChips(filters, agents);

  return (
    <div className="flex flex-col gap-3 px-5 pb-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SegmentedControl
          label="Listing purpose"
          value={filters.purpose}
          onChange={(value) => onChange({ ...filters, purpose: value, priceMin: null, priceMax: null })}
          options={[
            { value: "all", label: "All" },
            { value: "sale", label: "For sale" },
            { value: "rent", label: "For rent" },
          ]}
        />
        <SearchInput
          value={filters.query}
          onChange={(query) => set("query", query)}
          placeholder="Search title, society, block, address, ID…"
          label="Search properties"
          className="lg:max-w-sm lg:flex-1"
        />
        <div className="flex items-center gap-2 lg:ml-auto">
          <Select value={sort} onValueChange={(value) => onSort(value as PropertySort)}>
            <SelectTrigger aria-label="Sort listings" className="h-8 w-44 bg-card shadow-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SegmentedControl
            label="Layout"
            value={view}
            onChange={onView}
            options={[
              { value: "grid", label: <><LayoutGrid className="size-4" aria-hidden /><span className="sr-only">Grid</span></>, title: "Grid view" },
              { value: "list", label: <><List className="size-4" aria-hidden /><span className="sr-only">List</span></>, title: "List view" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FacetFilter
          title="Type"
          selected={filters.types}
          onChange={(value) => set("types", value)}
          options={PROPERTY_TYPES.map((type) => ({ value: type, label: PROPERTY_TYPE_META[type].label, count: count(properties, (p) => p.type, type) }))}
        />
        <FacetFilter
          title="Status"
          selected={filters.statuses}
          onChange={(value) => set("statuses", value)}
          options={PROPERTY_STATUSES.map((status) => ({ value: status, label: PROPERTY_STATUS_LABELS[status], count: count(properties, (p) => p.status, status) }))}
        />
        <FacetFilter
          title="Location"
          searchable
          selected={filters.locations}
          onChange={(value) => set("locations", value)}
          options={locations.map((location) => ({ value: location, label: location, count: count(properties, (p) => p.location, location) }))}
        />
        <Button variant="outline" onClick={onOpenAdvanced}>
          <SlidersHorizontal className="text-muted-foreground" />
          More filters
          {advanced > 0 && <span className="rounded-md bg-brand-soft px-1.5 text-xs font-semibold text-brand tabular">{advanced}</span>}
        </Button>
        <div className="ml-auto flex items-center gap-2 text-[13px] text-muted-foreground">
          <label htmlFor="area-unit" className="whitespace-nowrap max-sm:sr-only">
            Show area in
          </label>
          <Select value={unit} onValueChange={(value) => onUnit(value as DisplayUnit)}>
            <SelectTrigger id="area-unit" className="h-8 w-32 bg-card shadow-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value="listed">As listed</SelectItem>
              {AREA_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {AREA_UNIT_LABELS[u].long}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(chips.length > 0 || hasActivePropertyFilters(filters)) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span key={chip.key} className="flex h-7 items-center gap-1 rounded-full border bg-muted/40 pr-1 pl-2.5 text-xs text-secondary-foreground">
              {chip.label}
              <button
                type="button"
                onClick={() => onChange(chip.clear(filters))}
                aria-label={`Remove filter: ${chip.label}`}
                className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyPropertyFilters, areaUnit: filters.areaUnit })}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function activeChips(filters: PropertyFilters, agents: AgentOption[]) {
  const chips: { key: string; label: string; clear: (f: PropertyFilters) => PropertyFilters }[] = [];
  if (filters.category !== "all") {
    chips.push({ key: "category", label: PROPERTY_CATEGORY_LABELS[filters.category], clear: (f) => ({ ...f, category: "all" }) });
  }
  if (filters.priceMin !== null || filters.priceMax !== null) {
    const min = filters.priceMin !== null ? formatPKRCompact(filters.priceMin, { prefix: false }) : "Any";
    const max = filters.priceMax !== null ? formatPKRCompact(filters.priceMax, { prefix: false }) : "Any";
    chips.push({ key: "price", label: `Price ${min} – ${max}`, clear: (f) => ({ ...f, priceMin: null, priceMax: null }) });
  }
  if (filters.areaMin !== null || filters.areaMax !== null) {
    const unit = AREA_UNIT_LABELS[filters.areaUnit].short;
    chips.push({
      key: "area",
      label: `Area ${filters.areaMin ?? "Any"} – ${filters.areaMax ?? "Any"} ${unit}`,
      clear: (f) => ({ ...f, areaMin: null, areaMax: null }),
    });
  }
  if (filters.minBedrooms !== null) {
    chips.push({ key: "beds", label: `${filters.minBedrooms}+ bedrooms`, clear: (f) => ({ ...f, minBedrooms: null }) });
  }
  for (const agentId of filters.agents) {
    const name = agentId === UNASSIGNED ? "Unassigned" : (agents.find((a) => a.id === agentId)?.name ?? agentId);
    chips.push({ key: `agent-${agentId}`, label: `Agent: ${name}`, clear: (f) => ({ ...f, agents: f.agents.filter((a) => a !== agentId) }) });
  }
  for (const feature of filters.features) {
    chips.push({ key: `feature-${feature}`, label: feature, clear: (f) => ({ ...f, features: f.features.filter((x) => x !== feature) }) });
  }
  return chips;
}
