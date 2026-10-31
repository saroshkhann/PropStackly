import Link from "next/link";
import { Images, MessageSquareText } from "lucide-react";
import { AgentChip } from "@/components/shared/agent-chip";
import { PropertyStatusBadge } from "@/components/shared/property-row";
import { LISTING_PURPOSE_LABELS, type AreaUnit } from "@/domain/property";
import { cn } from "@/lib/utils";
import type { PropertyListItem } from "../data/types";
import { PropertyImageView } from "./property-image";
import { PropertyFacts, PropertyPrice } from "./property-facts";

export function PropertyCard({ property, unit }: { property: PropertyListItem; unit?: AreaUnit }) {
  const cover = property.images[0];
  const body = (
    <>
      <div className="relative">
        <PropertyImageView image={cover} className="aspect-[16/10] w-full" showMarker={false} sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-card backdrop-blur">
              {LISTING_PURPOSE_LABELS[property.purpose]}
            </span>
            {property.isDraft && (
              <span className="rounded-full border border-dashed border-warning/50 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-warning">Draft</span>
            )}
            {property.hasLocalEdits && (
              <span className="rounded-full border border-dashed border-warning/50 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-warning">Unsaved edits</span>
            )}
          </span>
          <PropertyStatusBadge status={property.status} className="h-5 bg-white/90 px-2 text-[11px] shadow-card backdrop-blur" />
        </div>
        <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          <Images className="size-3" aria-hidden />
          {property.images.length}
          <span className="sr-only">photos</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <PropertyPrice property={property} className="text-lg" />
        <div className="min-w-0">
          <h3 className="truncate text-[13.5px] font-medium text-foreground group-hover/card:underline group-hover/card:underline-offset-4">{property.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {property.sector}, {property.location}
          </p>
        </div>
        <PropertyFacts property={property} unit={unit} />
        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3 text-xs">
          <AgentChip name={property.agent?.name ?? null} short />
          <span className={cn("flex items-center gap-1 text-muted-foreground tabular", property.openInquiryCount > 0 && "font-medium text-brand")}>
            <MessageSquareText className="size-3.5" aria-hidden />
            {property.inquiryCount}
            <span className="sr-only">inquiries</span>
            {property.openInquiryCount > 0 && <span>· {property.openInquiryCount} new</span>}
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "group/card flex w-full flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-shadow duration-200 hover:shadow-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

  if (property.isDraft) return <article className={className}>{body}</article>;
  return (
    <Link href={`/properties/${property.id}`} className={className}>
      {body}
    </Link>
  );
}
