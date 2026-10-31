import Link from "next/link";
import { Building2, Factory, Home, LandPlot, Landmark, Store, Trees, Warehouse, type LucideIcon } from "lucide-react";
import { formatArea } from "@/domain/area";
import { PROPERTY_STATUS_LABELS, type Property, type PropertyStatus, type PropertyType } from "@/domain/property";
import { formatPKRCompact } from "@/lib/format";
import { StatusBadge, type StatusTone } from "./status-badge";

export const propertyTypeIcons: Record<PropertyType, LucideIcon> = {
  house: Home,
  apartment: Building2,
  portion: Home,
  plot: LandPlot,
  farmhouse: Trees,
  shop: Store,
  office: Landmark,
  commercial_plot: LandPlot,
  warehouse: Warehouse,
  building: Factory,
};

export const propertyStatusTones: Record<PropertyStatus, StatusTone> = {
  available: "success",
  under_offer: "warning",
  sold: "neutral",
  rented: "neutral",
  off_market: "neutral",
};

export function PropertyStatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  return (
    <StatusBadge tone={propertyStatusTones[status]} className={className}>
      {PROPERTY_STATUS_LABELS[status]}
    </StatusBadge>
  );
}

export function PropertyRow({ property, note }: { property: Property; note?: string }) {
  const Icon = propertyTypeIcons[property.type];
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/properties/${property.id}`}
          className="block truncate rounded-sm text-[13px] font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {property.title}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {property.location}, {property.city} · {formatArea(property.area)}
          {note ? ` · ${note}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[13px] font-semibold tabular">
          {formatPKRCompact(property.pricePKR)}
          {property.purpose === "rent" ? "/mo" : ""}
        </span>
        <PropertyStatusBadge status={property.status} className="h-5 px-2 text-[11px]" />
      </div>
    </div>
  );
}
