import type { ContactType } from "@/domain/contact";
import type { ContactListItem } from "../data/types";

export interface ContactFilters {
  query: string;
  type: ContactType | "all";
  owners: string[];
  tags: string[];
}

export const emptyContactFilters: ContactFilters = { query: "", type: "all", owners: [], tags: [] };

export function hasActiveContactFilters(filters: ContactFilters) {
  return Boolean(filters.query.trim()) || filters.type !== "all" || filters.owners.length > 0 || filters.tags.length > 0;
}

export function filterContacts(contacts: ContactListItem[], filters: ContactFilters) {
  const query = filters.query.toLowerCase().trim();
  const digits = filters.query.replace(/\D/g, "");
  return contacts.filter((contact) => {
    if (query) {
      const haystack = [contact.name, contact.area, contact.occupation ?? "", contact.email ?? "", ...contact.tags].join(" ").toLowerCase();
      const phoneMatch = digits.length >= 3 && contact.phoneMasked.replace(/\D/g, "").includes(digits);
      if (!haystack.includes(query) && !phoneMatch) return false;
    }
    if (filters.type !== "all" && !contact.types.includes(filters.type)) return false;
    if (filters.owners.length && !filters.owners.includes(contact.ownerId)) return false;
    if (filters.tags.length && !filters.tags.some((tag) => contact.tags.includes(tag))) return false;
    return true;
  });
}
