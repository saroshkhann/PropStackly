import type { TenantScoped } from "./tenancy";

export type ContactType = "buyer" | "seller" | "landlord" | "tenant" | "investor";

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  buyer: "Buyer",
  seller: "Seller",
  landlord: "Landlord",
  tenant: "Tenant",
  investor: "Investor",
};

export const CONTACT_TYPES = Object.keys(CONTACT_TYPE_LABELS) as ContactType[];

export interface Contact extends TenantScoped {
  id: string;
  name: string;
  types: ContactType[];
  phoneMasked: string;
  /** Whether the contact has confirmed WhatsApp on their primary number. */
  hasWhatsApp: boolean;
  email: string | null;
  city: string;
  area: string;
  occupation: string | null;
  tags: string[];
  ownerId: string;
  notes: string | null;
  createdAt: string;
  lastContactedAt: string | null;
}
