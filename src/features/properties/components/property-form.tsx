"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { AREA_UNITS, AREA_UNIT_LABELS, convertArea, formatArea } from "@/domain/area";
import {
  LISTING_PURPOSE_LABELS,
  PROPERTY_AMENITIES,
  PROPERTY_FEATURES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_META,
  statusesFor,
  type AreaUnit,
  type PropertyCategory,
  type PropertyImage,
} from "@/domain/property";
import { formatPKRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyFormOptions, PropertyListItem } from "../data/types";
import { applyPropertyForm } from "../lib/apply-property-form";
import {
  PAKISTAN_CITIES,
  propertyFormDefaults,
  propertyFormSchema,
  propertyToFormInput,
  type PropertyFormInput,
  type PropertyFormValues,
} from "../lib/property-schema";
import { ImageUploader } from "./image-uploader";
import { usePropertySession } from "./property-session";
import { SegmentedControl } from "./segmented-control";

const sessionOnly = "Demo only — kept for this browser session and reset on reload.";

interface PropertyFormProps {
  /** Present when editing; absent when creating a listing. */
  property?: PropertyListItem;
  options: PropertyFormOptions;
  now: string;
  agencyId: string;
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => onChange(selected ? value.filter((v) => v !== option) : [...value, option])}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] text-secondary-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              selected && "border-primary bg-brand-soft font-medium text-brand hover:bg-brand-soft",
            )}
          >
            {selected && <Check className="size-3.5" aria-hidden />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function PropertyForm({ property, options, now, agencyId }: PropertyFormProps) {
  const router = useRouter();
  const session = usePropertySession();
  const editing = Boolean(property);
  const [images, setImages] = useState<PropertyImage[]>(property?.images ?? []);
  const [ownerOpen, setOwnerOpen] = useState(false);

  const { register, control, handleSubmit, setValue, getValues, formState } = useForm<PropertyFormInput, unknown, PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property ? propertyToFormInput(property) : propertyFormDefaults,
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;
  const [purpose, category, type, price, areaValue, areaUnit, description] = useWatch({
    control,
    name: ["purpose", "category", "type", "price", "areaValue", "areaUnit", "description"],
  });
  const hasRooms = PROPERTY_TYPE_META[type].hasRooms;
  const typesForCategory = PROPERTY_TYPES.filter((t) => PROPERTY_TYPE_META[t].category === category);
  const priceNumber = Number(String(price).replace(/,/g, ""));
  const areaNumber = Number(String(areaValue).replace(/,/g, ""));

  const onCategory = (next: PropertyCategory) => {
    setValue("category", next, { shouldDirty: true });
    if (PROPERTY_TYPE_META[getValues("type")].category !== next) {
      setValue("type", PROPERTY_TYPES.find((t) => PROPERTY_TYPE_META[t].category === next)!, { shouldValidate: true });
    }
  };

  const onPurpose = (next: "sale" | "rent") => {
    setValue("purpose", next, { shouldDirty: true });
    if (!statusesFor(next).includes(getValues("status"))) setValue("status", "available");
  };

  const submit = handleSubmit((values) => {
    const saved = applyPropertyForm({
      base: property ?? null,
      values,
      images,
      options,
      now,
      agencyId,
      draftId: `draft_${crypto.randomUUID().slice(0, 8)}`,
    });
    session.save(saved);
    toast.success(editing ? "Listing updated" : `${values.title} added as a draft listing`, { description: sessionOnly });
    router.push(editing ? `/properties/${saved.id}` : "/properties");
  });

  const cancelHref = property ? `/properties/${property.id}` : "/properties";

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6 pb-20">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <SectionCard title="Listing basics" description="How the listing appears to your team and on portals.">
            <div className="flex flex-col gap-5">
              <FormField id="pf-title" label="Title" required error={errors.title?.message}>
                {(a11y) => <Input {...a11y} placeholder="e.g. 10 Marla Brand New Modern House" {...register("title")} />}
              </FormField>
              <FormField
                id="pf-description"
                label="Description"
                required
                error={errors.description?.message}
                hint={`${description.length}/1500 · Mention condition, orientation, nearby landmarks, and possession.`}
              >
                {(a11y) => <Textarea {...a11y} rows={5} {...register("description")} />}
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium">
                    Purpose <span className="text-danger" aria-hidden>*</span>
                  </span>
                  <SegmentedControl
                    label="Purpose"
                    value={purpose}
                    onChange={onPurpose}
                    className="w-fit"
                    options={[
                      { value: "sale", label: LISTING_PURPOSE_LABELS.sale },
                      { value: "rent", label: LISTING_PURPOSE_LABELS.rent },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium">
                    Category <span className="text-danger" aria-hidden>*</span>
                  </span>
                  <SegmentedControl
                    label="Category"
                    value={category}
                    onChange={onCategory}
                    className="w-fit"
                    options={[
                      { value: "residential", label: "Residential" },
                      { value: "commercial", label: "Commercial" },
                    ]}
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="pf-type" label="Property type" required error={errors.type?.message}>
                  {(a11y) => (
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent position="popper">
                            {typesForCategory.map((t) => (
                              <SelectItem key={t} value={t}>{PROPERTY_TYPE_META[t].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
                <FormField id="pf-status" label="Listing status" required error={errors.status?.message}>
                  {(a11y) => (
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent position="popper">
                            {statusesFor(purpose).map((s) => (
                              <SelectItem key={s} value={s}>{PROPERTY_STATUS_LABELS[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Location">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="pf-city" label="City" required error={errors.city?.message}>
                {(a11y) => (
                  <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper">
                          {PAKISTAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField id="pf-location" label="Society or area" required error={errors.location?.message} hint="e.g. DHA Phase 6, Bahria Town, Gulberg III">
                {(a11y) => <Input {...a11y} list="pf-known-locations" autoComplete="off" {...register("location")} />}
              </FormField>
              <datalist id="pf-known-locations">
                {options.locations.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              <FormField id="pf-sector" label="Phase, block, or sector" required error={errors.sector?.message}>
                {(a11y) => <Input {...a11y} placeholder="e.g. Block C" {...register("sector")} />}
              </FormField>
              <FormField id="pf-address" label="Address" required error={errors.address?.message}>
                {(a11y) => <Input {...a11y} placeholder="e.g. House 42, Street 7" {...register("address")} />}
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Price & size">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="pf-price"
                label={purpose === "rent" ? "Monthly rent (PKR)" : "Asking price (PKR)"}
                required
                error={errors.price?.message}
                hint={priceNumber > 0 ? `≈ ${formatPKRCompact(priceNumber)}${purpose === "rent" ? " per month" : ""}` : "Full amount in rupees, e.g. 45000000"}
              >
                {(a11y) => <Input {...a11y} inputMode="numeric" {...register("price")} />}
              </FormField>
              <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                <FormField
                  id="pf-area"
                  label="Area"
                  required
                  error={errors.areaValue?.message}
                  hint={
                    areaNumber > 0
                      ? AREA_UNITS.filter((u) => u !== areaUnit)
                          .slice(0, 2)
                          .map((u) => formatArea(convertArea({ value: areaNumber, unit: areaUnit }, u)))
                          .join(" · ")
                      : "Sizes convert at 225 sq ft per Marla"
                  }
                >
                  {(a11y) => <Input {...a11y} inputMode="decimal" {...register("areaValue")} />}
                </FormField>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium" id="pf-area-unit-label">Unit</span>
                  <Controller
                    control={control}
                    name="areaUnit"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(v) => field.onChange(v as AreaUnit)}>
                        <SelectTrigger aria-labelledby="pf-area-unit-label" className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper" align="end">
                          {AREA_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{AREA_UNIT_LABELS[u].long}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {hasRooms ? (
                <>
                  <FormField id="pf-bedrooms" label="Bedrooms" required error={errors.bedrooms?.message}>
                    {(a11y) => <Input {...a11y} type="number" min={0} max={20} inputMode="numeric" {...register("bedrooms")} />}
                  </FormField>
                  <FormField id="pf-bathrooms" label="Bathrooms" error={errors.bathrooms?.message}>
                    {(a11y) => <Input {...a11y} type="number" min={0} max={20} inputMode="numeric" {...register("bathrooms")} />}
                  </FormField>
                </>
              ) : (
                <p className="text-xs text-muted-foreground sm:col-span-2">Bedrooms and bathrooms don&apos;t apply to {PROPERTY_TYPE_META[type].label.toLowerCase()}s.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Features & amenities" description="Buyers filter on these, so tick everything that applies.">
            <div className="flex flex-col gap-5">
              <Controller
                control={control}
                name="features"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Features</p>
                    <ChipGroup label="Features" options={PROPERTY_FEATURES} value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="amenities"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Amenities</p>
                    <ChipGroup label="Amenities" options={PROPERTY_AMENITIES} value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Photos" description="The first photo is the cover on listings and portals.">
            <ImageUploader value={images} onChange={setImages} />
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-6">
          <SectionCard title="Owner & agent" className="xl:sticky xl:top-20">
            <div className="flex flex-col gap-5">
              <FormField
                id="pf-owner"
                label="Owner"
                required
                error={errors.ownerContactId?.message}
                hint={<>Owners come from your contacts. <Link href="/contacts" className="text-brand underline-offset-4 hover:underline">Add a new owner</Link></>}
              >
                {(a11y) => (
                  <Controller
                    control={control}
                    name="ownerContactId"
                    render={({ field }) => {
                      const selected = options.owners.find((o) => o.id === field.value);
                      return (
                        <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              {...a11y}
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={ownerOpen}
                              className={cn("h-9 w-full justify-between font-normal", !selected && "text-muted-foreground")}
                              onBlur={field.onBlur}
                            >
                              <span className="truncate">{selected ? `${selected.name} · ${selected.phoneMasked}` : "Search owners…"}</span>
                              <ChevronsUpDown className="text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
                            <Command>
                              <CommandInput placeholder="Search by name…" />
                              <CommandList>
                                <CommandEmpty>No owner found. Add them in Contacts first.</CommandEmpty>
                                <CommandGroup>
                                  {options.owners.map((owner) => (
                                    <CommandItem
                                      key={owner.id}
                                      value={`${owner.name} ${owner.phoneMasked}`}
                                      onSelect={() => {
                                        field.onChange(owner.id);
                                        setOwnerOpen(false);
                                      }}
                                    >
                                      <span className="min-w-0 flex-1 truncate">{owner.name}</span>
                                      <span className="text-xs text-muted-foreground tabular">{owner.phoneMasked}</span>
                                      {owner.id === field.value && <Check className="text-brand" aria-hidden />}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      );
                    }}
                  />
                )}
              </FormField>
              <FormField id="pf-agent" label="Assigned agent" hint="Leave unassigned to route it later.">
                {(a11y) => (
                  <Controller
                    control={control}
                    name="assignedAgentId"
                    render={({ field }) => (
                      <Select value={field.value || "__none"} onValueChange={(v) => field.onChange(v === "__none" ? "" : v)}>
                        <SelectTrigger {...a11y} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="__none">Unassigned</SelectItem>
                          {options.agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
            </div>
          </SectionCard>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur md:pl-[68px] lg:pl-[256px]">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FlaskConical className="size-3.5 shrink-0" aria-hidden />
            <span className="max-sm:hidden">Demo: saved for this browser session only</span>
            <span className="sm:hidden">Session only</span>
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? "Save changes" : "Add listing"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
