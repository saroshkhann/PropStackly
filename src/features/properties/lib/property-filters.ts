import { convertArea } from "@/domain/area";
import type { AreaUnit, ListingPurpose, PropertyCategory, PropertyStatus, PropertyType } from "@/domain/property";
import type { PropertyListItem } from "../data/types";

export const UNASSIGNED = "unassigned";

export type PropertySort = "newest" | "price_asc" | "price_desc" | "area_desc" | "inquiries";

export const SORT_LABELS: Record<PropertySort, string> = {
  newest: "Newest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  area_desc: "Largest area",
  inquiries: "Most inquiries",
};

export interface PropertyFilters {
  query: string;
  purpose: ListingPurpose | "all";
  category: PropertyCategory | "all";
  types: PropertyType[];
  statuses: PropertyStatus[];
  locations: string[];
  agents: string[];
  features: string[];
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  /** Unit the area range is expressed in. */
  areaUnit: AreaUnit;
  minBedrooms: number | null;
}

export const emptyPropertyFilters: PropertyFilters = {
  query: "",
  purpose: "all",
  category: "all",
  types: [],
  statuses: [],
  locations: [],
  agents: [],
  features: [],
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  areaUnit: "marla",
  minBedrooms: null,
};

/** Filters that live in the advanced drawer, counted on its trigger button. */
export function advancedFilterCount(filters: PropertyFilters) {
  return (
    (filters.category !== "all" ? 1 : 0) +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0) +
    (filters.areaMin !== null || filters.areaMax !== null ? 1 : 0) +
    (filters.minBedrooms !== null ? 1 : 0) +
    (filters.agents.length ? 1 : 0) +
    (filters.features.length ? 1 : 0)
  );
}

export function hasActivePropertyFilters(filters: PropertyFilters) {
  return (
    Boolean(filters.query.trim()) ||
    filters.purpose !== "all" ||
    filters.types.length + filters.statuses.length + filters.locations.length > 0 ||
    advancedFilterCount(filters) > 0
  );
}

export function filterProperties(properties: PropertyListItem[], filters: PropertyFilters) {
  const query = filters.query.toLowerCase().trim();
  return properties.filter((p) => {
    if (query) {
      const haystack = [p.title, p.location, p.sector, p.address, p.city, p.id, p.owner?.name ?? ""].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.purpose !== "all" && p.purpose !== filters.purpose) return false;
    if (filters.category !== "all" && p.category !== filters.category) return false;
    if (filters.types.length && !filters.types.includes(p.type)) return false;
    if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
    if (filters.locations.length && !filters.locations.includes(p.location)) return false;
    if (filters.agents.length && !filters.agents.includes(p.assignedAgentId ?? UNASSIGNED)) return false;
    if (filters.features.length && !filters.features.every((f) => p.features.includes(f) || p.amenities.includes(f))) return false;
    if (filters.priceMin !== null && p.pricePKR < filters.priceMin) return false;
    if (filters.priceMax !== null && p.pricePKR > filters.priceMax) return false;
    if (filters.areaMin !== null || filters.areaMax !== null) {
      const value = convertArea(p.area, filters.areaUnit).value;
      if (filters.areaMin !== null && value < filters.areaMin) return false;
      if (filters.areaMax !== null && value > filters.areaMax) return false;
    }
    if (filters.minBedrooms !== null && (p.bedrooms ?? 0) < filters.minBedrooms) return false;
    return true;
  });
}

export function sortProperties(properties: PropertyListItem[], sort: PropertySort) {
  const sorted = [...properties];
  const sqft = (p: PropertyListItem) => convertArea(p.area, "sqft").value;
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.pricePKR - b.pricePKR);
    case "price_desc":
      return sorted.sort((a, b) => b.pricePKR - a.pricePKR);
    case "area_desc":
      return sorted.sort((a, b) => sqft(b) - sqft(a));
    case "inquiries":
      return sorted.sort((a, b) => b.inquiryCount - a.inquiryCount);
    default:
      return sorted.sort((a, b) => Number(Boolean(b.isDraft)) - Number(Boolean(a.isDraft)) || b.listedAt.localeCompare(a.listedAt));
  }
}
