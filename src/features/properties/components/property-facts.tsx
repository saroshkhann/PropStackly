import { Bath, BedDouble, Ruler } from "lucide-react";
import { formatArea } from "@/domain/area";
import type { AreaUnit, Property } from "@/domain/property";
import { formatPKRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Beds · baths · area summary used on cards and table rows. */
export function PropertyFacts({ property, unit, className }: { property: Property; unit?: AreaUnit; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      {property.bedrooms !== null && (
        <li className="flex items-center gap-1">
          <BedDouble className="size-3.5" aria-hidden />
          <span className="tabular">{property.bedrooms}</span>
          <span className="sr-only">bedrooms</span>
        </li>
      )}
      {property.bathrooms !== null && (
        <li className="flex items-center gap-1">
          <Bath className="size-3.5" aria-hidden />
          <span className="tabular">{property.bathrooms}</span>
          <span className="sr-only">bathrooms</span>
        </li>
      )}
      <li className="flex items-center gap-1">
        <Ruler className="size-3.5" aria-hidden />
        <span className="tabular">{formatArea(property.area, unit)}</span>
      </li>
    </ul>
  );
}

export function PropertyPrice({ property, className }: { property: Property; className?: string }) {
  return (
    <p className={cn("font-semibold tracking-[-0.01em] text-foreground tabular", className)}>
      <span className="mr-1 text-[0.7em] font-medium text-muted-foreground">PKR</span>
      {formatPKRCompact(property.pricePKR, { prefix: false })}
      {property.purpose === "rent" && <span className="ml-0.5 text-[0.7em] font-medium text-muted-foreground">/month</span>}
    </p>
  );
}
