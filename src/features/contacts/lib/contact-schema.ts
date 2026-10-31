import { z } from "zod";
import { CONTACT_TYPES, type Contact } from "@/domain/contact";
import { optionalEmailSchema, optionalPhoneSchema, phoneSchema } from "@/lib/validation";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter the contact's full name").max(80, "Keep it under 80 characters"),
  types: z.array(z.enum(CONTACT_TYPES)).min(1, "Choose at least one role"),
  phone: phoneSchema,
  hasWhatsApp: z.boolean(),
  email: optionalEmailSchema,
  area: z.string().trim().min(2, "Add an area or society").max(60),
  occupation: z.string().trim().max(60),
  ownerId: z.string().min(1, "Choose who manages this contact"),
  tags: z
    .string()
    .trim()
    .max(160)
    .refine((value) => value.split(",").filter((tag) => tag.trim()).length <= 6, "Up to 6 tags"),
  notes: z.string().trim().max(500, "Keep notes under 500 characters"),
});

export const contactEditSchema = contactFormSchema.extend({ phone: optionalPhoneSchema });

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactFormDefaults: ContactFormValues = {
  name: "",
  types: ["buyer"],
  phone: "",
  hasWhatsApp: true,
  email: "",
  area: "",
  occupation: "",
  ownerId: "",
  tags: "",
  notes: "",
};

/** Edit forms start from the stored contact; the stored phone is masked, so an empty field keeps it. */
export function contactToFormValues(contact: Contact): ContactFormValues {
  return {
    name: contact.name,
    types: contact.types,
    phone: "",
    hasWhatsApp: contact.hasWhatsApp,
    email: contact.email ?? "",
    area: contact.area,
    occupation: contact.occupation ?? "",
    ownerId: contact.ownerId,
    tags: contact.tags.join(", "),
    notes: contact.notes ?? "",
  };
}

export function parseTags(raw: string) {
  return [...new Set(raw.split(",").map((tag) => tag.trim()).filter(Boolean))];
}
