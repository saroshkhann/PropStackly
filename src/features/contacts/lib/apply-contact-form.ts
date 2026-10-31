import type { AgentOption } from "@/features/workspace/types";
import { maskPhone } from "@/lib/validation";
import type { ContactListItem } from "../data/types";
import { parseTags, type ContactFormValues } from "./contact-schema";

export function applyContactForm(contact: ContactListItem, values: ContactFormValues, agents: AgentOption[]): ContactListItem {
  const owner = agents.find((agent) => agent.id === values.ownerId);
  return {
    ...contact,
    name: values.name,
    types: values.types,
    phoneMasked: values.phone ? maskPhone(values.phone) : contact.phoneMasked,
    hasWhatsApp: values.hasWhatsApp,
    email: values.email || null,
    area: values.area,
    occupation: values.occupation || null,
    ownerId: values.ownerId,
    owner: owner ? { id: owner.id, name: owner.name } : contact.owner,
    tags: parseTags(values.tags),
    notes: values.notes || null,
  };
}
