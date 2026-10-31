"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PipelineStage } from "@/domain/deal";
import { SegmentedControl } from "@/features/properties/components/segmented-control";
import { defaultBoardSettings, type BoardSettings, type DealSort } from "../lib/pipeline";
import { stageAccent } from "./stage-meta";

const fieldLabels: Record<keyof BoardSettings["fields"], string> = {
  customer: "Customer",
  property: "Property",
  agent: "Assigned agent",
  closeDate: "Expected close",
};

const sortLabels: Record<DealSort, string> = {
  updated: "Recently updated",
  value: "Highest value",
  close_date: "Closing soonest",
};

export function BoardCustomizer({ stages, settings, onChange }: { stages: PipelineStage[]; settings: BoardSettings; onChange: (settings: BoardSettings) => void }) {
  const hiddenCount = settings.hiddenStages.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings2 className="text-muted-foreground" />
          Customize
          {hiddenCount > 0 && <span className="rounded-md bg-brand-soft px-1.5 text-xs font-semibold text-brand tabular">{hiddenCount} hidden</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Board view</p>
          <p className="text-xs text-muted-foreground">Only changes your view; resets on reload.</p>
        </div>
        <div className="flex flex-col gap-4 px-4 py-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium text-muted-foreground">Stages</legend>
            {stages.map((stage) => {
              const id = `stage-visible-${stage.id}`;
              const visible = !settings.hiddenStages.includes(stage.id);
              return (
                <div key={stage.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={id}
                    checked={visible}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...settings,
                        hiddenStages: checked ? settings.hiddenStages.filter((s) => s !== stage.id) : [...settings.hiddenStages, stage.id],
                      })
                    }
                  />
                  <span className="size-2 rounded-full" style={{ backgroundColor: stageAccent[stage.id] }} aria-hidden />
                  <Label htmlFor={id} className="text-[13px] font-normal">
                    {stage.label}
                  </Label>
                </div>
              );
            })}
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium text-muted-foreground">Card details</legend>
            {(Object.keys(fieldLabels) as (keyof BoardSettings["fields"])[]).map((field) => (
              <div key={field} className="flex items-center gap-2.5">
                <Checkbox
                  id={`field-${field}`}
                  checked={settings.fields[field]}
                  onCheckedChange={(checked) => onChange({ ...settings, fields: { ...settings.fields, [field]: checked === true } })}
                />
                <Label htmlFor={`field-${field}`} className="text-[13px] font-normal">
                  {fieldLabels[field]}
                </Label>
              </div>
            ))}
          </fieldset>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Density</span>
            <SegmentedControl
              label="Card density"
              size="sm"
              value={settings.density}
              onChange={(density) => onChange({ ...settings, density })}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-sort" className="text-xs font-medium text-muted-foreground">
              Sort cards by
            </Label>
            <Select value={settings.sort} onValueChange={(sort) => onChange({ ...settings, sort: sort as DealSort })}>
              <SelectTrigger id="board-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {Object.entries(sortLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="border-t px-4 py-2.5">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => onChange(defaultBoardSettings)}>
            Reset view
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
