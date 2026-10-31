import type { LeadSourceId } from "./lead";
import type { TenantScoped } from "./tenancy";

export type PropertyCategory = "residential" | "commercial";
export type ListingPurpose = "sale" | "rent";
export type PropertyStatus = "available" | "under_offer" | "sold" | "rented" | "off_market";
export type PropertyType =
  | "house"
  | "apartment"
  | "portion"
  | "plot"
  | "farmhouse"
  | "shop"
  | "office"
  | "commercial_plot"
  | "warehouse"
  | "building";

export const PROPERTY_TYPE_META: Record<PropertyType, { label: string; category: PropertyCategory; hasRooms: boolean }> = {
  house: { label: "House", category: "residential", hasRooms: true },
  apartment: { label: "Apartment", category: "residential", hasRooms: true },
  portion: { label: "Upper/lower portion", category: "residential", hasRooms: true },
  plot: { label: "Residential plot", category: "residential", hasRooms: false },
  farmhouse: { label: "Farmhouse", category: "residential", hasRooms: true },
  shop: { label: "Shop", category: "commercial", hasRooms: false },
  office: { label: "Office", category: "commercial", hasRooms: false },
  commercial_plot: { label: "Commercial plot", category: "commercial", hasRooms: false },
  warehouse: { label: "Warehouse", category: "commercial", hasRooms: false },
  building: { label: "Building", category: "commercial", hasRooms: false },
};

export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_META) as PropertyType[];

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

export const LISTING_PURPOSE_LABELS: Record<ListingPurpose, string> = {
  sale: "For sale",
  rent: "For rent",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Available",
  under_offer: "Under offer",
  sold: "Sold",
  rented: "Rented",
  off_market: "Off market",
};

export const PROPERTY_STATUSES = Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[];

/** Statuses that make sense for each purpose; a rental can't be "sold". */
export function statusesFor(purpose: ListingPurpose): PropertyStatus[] {
  return purpose === "sale" ? ["available", "under_offer", "sold", "off_market"] : ["available", "under_offer", "rented", "off_market"];
}

export type AreaUnit = "marla" | "kanal" | "sqft" | "sqyd";

export interface PropertyArea {
  value: number;
  unit: AreaUnit;
}

export const PROPERTY_FEATURES = [
  "Corner",
  "Park facing",
  "Main boulevard",
  "Double unit",
  "Basement",
  "Servant quarter",
  "Drawing & dining",
  "Store room",
  "Lift",
  "Furnished",
  "Solar system",
  "Lawn",
  "Possession ready",
  "Bank financing eligible",
] as const;

export const PROPERTY_AMENITIES = [
  "Sui gas",
  "Electricity backup",
  "Water bore",
  "24/7 security",
  "Gated community",
  "Mosque nearby",
  "School nearby",
  "Hospital nearby",
  "Commercial area nearby",
  "Parking",
  "Gym",
  "Swimming pool",
] as const;

export type PropertyImageLabel =
  | "Front elevation"
  | "Drawing room"
  | "Kitchen"
  | "Master bedroom"
  | "Lawn"
  | "Plot map"
  | "Street view"
  | "Interior"
  | "Building exterior";

export interface PropertyImage {
  id: string;
  label: string;
  /** Sample artwork for demo listings; `local` previews are object URLs that never leave the browser. */
  source: { kind: "sample"; tone: number } | { kind: "local"; url: string; fileName: string };
}

export interface Property extends TenantScoped {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  purpose: ListingPurpose;
  status: PropertyStatus;
  city: string;
  location: string;
  sector: string;
  address: string;
  /** Asking price; monthly rent for rentals. */
  pricePKR: number;
  area: PropertyArea;
  bedrooms: number | null;
  bathrooms: number | null;
  features: string[];
  amenities: string[];
  images: PropertyImage[];
  ownerContactId: string | null;
  assignedAgentId: string | null;
  listedAt: string;
  updatedAt: string;
}

export type InquiryStatus = "new" | "responded" | "visit_scheduled" | "closed";

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  responded: "Responded",
  visit_scheduled: "Visit scheduled",
  closed: "Closed",
};

export interface PropertyInquiry extends TenantScoped {
  id: string;
  propertyId: string;
  leadId: string | null;
  name: string;
  phoneMasked: string;
  sourceId: LeadSourceId;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}
