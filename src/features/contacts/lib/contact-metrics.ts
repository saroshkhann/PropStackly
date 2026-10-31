import type { ContactListItem } from "../data/types";

const DAY_MS = 86_400_000;

export function summarizeContacts(contacts: ContactListItem[], now: string) {
  const nowMs = new Date(now).getTime();
  const has = (contact: ContactListItem, ...types: ContactListItem["types"]) => types.some((type) => contact.types.includes(type));
  return {
    total: contacts.length,
    addedThisMonth: contacts.filter((c) => nowMs - new Date(c.createdAt).getTime() <= 30 * DAY_MS).length,
    buyers: contacts.filter((c) => has(c, "buyer", "investor", "tenant")).length,
    owners: contacts.filter((c) => has(c, "seller", "landlord")).length,
    listings: contacts.reduce((sum, c) => sum + c.propertyCount, 0),
    goingCold: contacts.filter((c) => !c.lastContactedAt || nowMs - new Date(c.lastContactedAt).getTime() > 14 * DAY_MS).length,
  };
}
