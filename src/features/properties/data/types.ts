import type { Contact } from "@/domain/contact";
import type { Property, PropertyInquiry } from "@/domain/property";
import type { AgentOption, MemberRef } from "@/features/workspace/types";

export interface OwnerRef {
  id: string;
  name: string;
  phoneMasked: string;
}

export interface PropertyListItem extends Property {
  owner: OwnerRef | null;
  agent: MemberRef | null;
  inquiryCount: number;
  openInquiryCount: number;
  lastInquiryAt: string | null;
  /** Created in this browser session only; never persisted. */
  isDraft?: boolean;
  /** Edited in this browser session; edits reset on reload. */
  hasLocalEdits?: boolean;
}

export interface InquiryEntry extends PropertyInquiry {
  sourceLabel: string;
}

export interface ListingEvent {
  id: string;
  title: string;
  detail: string | null;
  at: string;
}

export interface PropertyFormOptions {
  agents: AgentOption[];
  owners: OwnerRef[];
  locations: string[];
}

export interface PropertiesPageData extends PropertyFormOptions {
  now: string;
  properties: PropertyListItem[];
}

export interface PropertyDetailData extends PropertyFormOptions {
  now: string;
  property: PropertyListItem;
  owner: Contact | null;
  inquiries: InquiryEntry[];
  history: ListingEvent[];
}
