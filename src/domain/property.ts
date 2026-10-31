import type { TenantScoped } from "./tenancy";

export type PropertyType = "house" | "plot" | "apartment" | "commercial" | "farmhouse";
export type PropertyStatus = "available" | "under_offer" | "sold" | "rented" | "off_market";
export type ListingPurpose = "sale" | "rent";

export interface Property extends TenantScoped {
  id: string;
  title: string;
  type: PropertyType;
  purpose: ListingPurpose;
  status: PropertyStatus;
  area: string;
  city: string;
  size: string;
  pricePKR: number;
  listedAt: string;
}
