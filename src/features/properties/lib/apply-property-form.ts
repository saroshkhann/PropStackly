import type { PropertyImage } from "@/domain/property";
import type { PropertyFormOptions, PropertyListItem } from "../data/types";
import type { PropertyFormValues } from "./property-schema";

interface ApplyOptions {
  base: PropertyListItem | null;
  values: PropertyFormValues;
  images: PropertyImage[];
  options: PropertyFormOptions;
  now: string;
  agencyId: string;
  draftId: string;
}

/** Builds the session-only listing that results from submitting the property form. */
export function applyPropertyForm({ base, values, images, options, now, agencyId, draftId }: ApplyOptions): PropertyListItem {
  const owner = options.owners.find((o) => o.id === values.ownerContactId) ?? null;
  const agent = options.agents.find((a) => a.id === values.assignedAgentId);
  return {
    ...(base ?? {
      id: draftId,
      agencyId,
      listedAt: now,
      inquiryCount: 0,
      openInquiryCount: 0,
      lastInquiryAt: null,
      isDraft: true,
    }),
    title: values.title,
    description: values.description,
    type: values.type,
    category: values.category,
    purpose: values.purpose,
    status: values.status,
    city: values.city,
    location: values.location,
    sector: values.sector,
    address: values.address,
    pricePKR: values.price,
    area: { value: values.areaValue, unit: values.areaUnit },
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    features: values.features,
    amenities: values.amenities,
    images,
    ownerContactId: owner?.id ?? null,
    owner,
    assignedAgentId: agent?.id ?? null,
    agent: agent ? { id: agent.id, name: agent.name } : null,
    updatedAt: now,
    hasLocalEdits: base ? true : undefined,
  };
}
